#!/usr/bin/env node
/**
 * 一条命令完成「拉取 -> 合并 -> 推送」，并在推送被 Axhub 自动发布抢先时自动重试。
 * 用法：node scripts/sync-push.mjs [--branch master]
 */
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
function flagValue(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const branch = flagValue('--branch', 'master');
const maxAttempts = Number(flagValue('--retries', '5'));

function git(...cmd) {
  const res = spawnSync('git', cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { code: res.status ?? 1, out: (res.stdout || '').trim(), err: (res.stderr || '').trim() };
}

function fail(message, detail) {
  console.error(`\n[停止] ${message}`);
  if (detail) console.error(detail);
  process.exit(1);
}

function step(message) {
  console.log(`\n==> ${message}`);
}

function counts(sha) {
  const res = git('rev-list', '--left-right', '--count', `HEAD...${sha}`);
  if (res.code !== 0) fail('无法比较本地与远程版本。', res.err);
  const [ahead, behind] = res.out.split('\t').map(Number);
  return { ahead, behind };
}

function localChanges() {
  const res = git('status', '--porcelain');
  if (res.code !== 0) fail('无法检查工作区状态。', res.err);
  return res.out.split('\n').filter(Boolean);
}

step(`检查仓库状态（分支 ${branch}）`);
const root = git('rev-parse', '--show-toplevel');
if (root.code !== 0) fail('当前目录不是 Git 仓库。', root.err);
const head = git('rev-parse', '--abbrev-ref', 'HEAD');
if (head.code !== 0) fail('无法读取当前分支。', head.err);
if (head.out !== branch) fail(`当前在 ${head.out} 分支，不是 ${branch}。请先切换分支再运行。`);
if (git('rev-parse', '-q', '--verify', 'MERGE_HEAD').code === 0) {
  fail('存在未完成的合并。请先处理完这次合并，再运行本脚本。');
}

const changes = localChanges();
if (changes.length > 0) {
  console.error(`[停止] 工作区还有 ${changes.length} 处未提交改动：`);
  for (const line of changes.slice(0, 20)) console.error('   ' + line);
  if (changes.length > 20) console.error(`   ... 还有 ${changes.length - 20} 处`);
  console.error('\n请先提交（或确认这些改动可以保留）后再同步。本脚本不会替你提交或丢弃改动。');
  process.exit(1);
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  step(`第 ${attempt} 次同步尝试`);
  const fetched = git('fetch', 'origin', branch);
  if (fetched.code !== 0) fail('无法连接远程仓库。', fetched.err);

  const remote = git('rev-parse', `refs/remotes/origin/${branch}`);
  if (remote.code !== 0) fail(`远程不存在 ${branch} 分支。`, remote.err);
  const { ahead, behind } = counts(remote.out);

  if (behind > 0) {
    step(`远程有 ${behind} 个本地没有的提交，先合并`);
    if (ahead > 0) console.log(`    （本地同时有 ${ahead} 个提交尚未推送，属于正常分叉）`);
    const merged = git('merge', '--no-edit', remote.out);
    if (merged.code !== 0) {
      git('merge', '--abort');
      console.error(`[停止] 合并远程提交时出现冲突，已自动撤销合并，你的文件没有被改动。`);
      console.error(merged.err || merged.out);
      console.error('\n这类冲突需要人工决定保留哪份内容，请把上面的信息发给 AI 协助处理。');
      process.exit(1);
    }
    console.log('    合并完成，无冲突。');
  }

  const after = counts(remote.out);
  if (after.ahead === 0) {
    console.log(`\n[完成] 本地与 origin/${branch} 已一致，无需推送。`);
    process.exit(0);
  }

  step(`推送 ${after.ahead} 个提交到 origin/${branch}`);
  const pushed = git('push', 'origin', `HEAD:refs/heads/${branch}`);
  const pushMessage = (pushed.out + '\n' + pushed.err).trim();
  if (pushed.code === 0) {
    console.log(pushMessage);
    console.log(`\n[完成] 已同步到 origin/${branch}。`);
    process.exit(0);
  }

  console.error(pushMessage);
  if (!/fetch first|non-fast-forward|\[rejected\]/i.test(pushMessage)) {
    fail('推送失败，原因不是版本落后。请把上面的报错发给 AI 判断，不要强行推送。');
  }
  console.log('    远程又前进了（Axhub 自动发布抢在你之前推送），重新同步后再试。');
}

fail(`${maxAttempts} 次尝试后仍未能推送。远程发布过于频繁，请暂停 Axhub 自动发布后再运行一次。`);
