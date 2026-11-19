import type { ItemRow, PlanRow, WordRow } from '../data/types';

export type AdViewKey = 'store' | 'item' | 'plan' | 'word';

export type AdStoreRow = {
  storeId: number;
  storeName: string;
  alias: string;
  daysAvailable: number;
  adCost: number;
  adGmv: number;
  storeGmv: number;
  adRatio: number | null;
  roas: number | null;
};

export type AdRow = AdStoreRow | ItemRow | PlanRow | WordRow;

export type DetailTarget =
  | { view: 'store'; row: AdStoreRow }
  | { view: 'item'; row: ItemRow }
  | { view: 'plan'; row: PlanRow }
  | { view: 'word'; row: WordRow };
