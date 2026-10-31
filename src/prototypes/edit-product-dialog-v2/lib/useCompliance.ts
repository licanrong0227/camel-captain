import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ComplianceFeedback,
  ComplianceItemCode,
  ComplianceItemRun,
  ComplianceScenario,
  ITEM_DEFS,
  getOutcome,
  getRetryOutcome,
} from './compliance';

const STORAGE_KEY = 'ep-compliance-v4';
const MAX_ROUNDS = 20;
const DETECT_MS = 1500;
const RETRY_MS = 800;

interface ProductRecord {
  productId: number;
  items: ComplianceItemRun[];
}

function readStore(): ProductRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductRecord[]) : [];
  } catch {
    return [];
  }
}

function writeStore(records: ProductRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* 原型演示，忽略存储失败 */
  }
}

const pushRound = (item: ComplianceItemRun, outcome: ComplianceItemRun['outcome'], at: number): ComplianceItemRun => ({
  ...item,
  outcome,
  at,
  history: item.history.concat({ at: item.at, outcome: item.outcome }).slice(-MAX_ROUNDS),
  feedback: {},
});

export interface UseComplianceResult {
  items: ComplianceItemRun[];
  hasRecord: boolean;
  checking: boolean;
  retryingCode: ComplianceItemCode | null;
  detect: (onDone?: () => void) => void;
  retryItem: (code: ComplianceItemCode) => void;
  saveFeedback: (code: ComplianceItemCode, hitIndex: number, feedback: ComplianceFeedback | null) => void;
  applyScenario: (scenario: ComplianceScenario) => boolean;
}

export function useCompliance(
  product: { id: number; title: string },
  scenario: ComplianceScenario,
): UseComplianceResult {
  const [store, setStore] = useState<ProductRecord[]>(() => readStore());
  const [checking, setChecking] = useState(false);
  const [retryingCode, setRetryingCode] = useState<ComplianceItemCode | null>(null);
  const detectTimer = useRef<number>();
  const retryTimer = useRef<number>();

  useEffect(() => {
    writeStore(store);
  }, [store]);

  useEffect(
    () => () => {
      window.clearTimeout(detectTimer.current);
      window.clearTimeout(retryTimer.current);
    },
    [],
  );

  const items = useMemo(
    () => store.find((record) => record.productId === product.id)?.items ?? [],
    [store, product.id],
  );

  const detect = useCallback(
    (onDone?: () => void) => {
      if (checking) return;
      setChecking(true);
      const productId = product.id;
      window.clearTimeout(detectTimer.current);
      detectTimer.current = window.setTimeout(() => {
        const now = Date.now();
        setStore((prev) => {
          const current = prev.find((record) => record.productId === productId);
          const nextItems = ITEM_DEFS.map((def) => {
            const outcome = getOutcome(scenario, def.code);
            const previous = current?.items.find((item) => item.code === def.code);
            return previous
              ? pushRound(previous, outcome, now)
              : { code: def.code, outcome, at: now, history: [], feedback: {} };
          });
          return prev.filter((record) => record.productId !== productId).concat({ productId, items: nextItems });
        });
        setChecking(false);
        onDone?.();
      }, DETECT_MS);
    },
    [checking, product.id, scenario],
  );

  const retryItem = useCallback(
    (code: ComplianceItemCode) => {
      if (retryingCode) return;
      setRetryingCode(code);
      const productId = product.id;
      window.clearTimeout(retryTimer.current);
      retryTimer.current = window.setTimeout(() => {
        setStore((prev) =>
          prev.map((record) => {
            if (record.productId !== productId) return record;
            return {
              ...record,
              items: record.items.map((item) =>
                item.code === code ? pushRound(item, getRetryOutcome(scenario, code), Date.now()) : item,
              ),
            };
          }),
        );
        setRetryingCode(null);
      }, RETRY_MS);
    },
    [product.id, retryingCode, scenario],
  );

  const saveFeedback = useCallback(
    (code: ComplianceItemCode, hitIndex: number, feedback: ComplianceFeedback | null) => {
      const productId = product.id;
      setStore((prev) =>
        prev.map((record) => {
          if (record.productId !== productId) return record;
          return {
            ...record,
            items: record.items.map((item) => {
              if (item.code !== code) return item;
              const key = `${code}:${hitIndex}`;
              const feedbackMap = { ...item.feedback };
              if (feedback) {
                feedbackMap[key] = feedback;
              } else {
                delete feedbackMap[key];
              }
              return { ...item, feedback: feedbackMap };
            }),
          };
        }),
      );
    },
    [product.id],
  );

  const applyScenario = useCallback(
    (next: ComplianceScenario) => {
      const productId = product.id;
      if (!items.length) return false;
      setStore((prev) =>
        prev.map((record) => {
          if (record.productId !== productId) return record;
          return {
            ...record,
            items: record.items.map((item) => ({
              ...item,
              outcome: getOutcome(next, item.code),
              history: [],
              feedback: {},
            })),
          };
        }),
      );
      return true;
    },
    [items.length, product.id],
  );

  return {
    items,
    hasRecord: items.length > 0,
    checking,
    retryingCode,
    detect,
    retryItem,
    saveFeedback,
    applyScenario,
  };
}
