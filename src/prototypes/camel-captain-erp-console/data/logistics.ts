import { createRng, dayOffset, intBetween, makeCode, pick } from './util';

export interface Provider {
  id: string;
  name: string;
  code: string;
  countries: string;
  channels: number;
  integration: string;
  status: boolean;
  updatedAt: string;
}

export interface Channel {
  id: string;
  provider: string;
  name: string;
  eta: string;
  billing: string;
  countries: string;
  status: boolean;
}

export interface TrackingEvent {
  time: string;
  location: string;
  description: string;
}

export interface Shipment {
  id: string;
  trackingNo: string;
  orderNo: string;
  provider: string;
  channel: string;
  country: string;
  receiver: string;
  lastEvent: string;
  status: string;
  updatedAt: string;
  events: TrackingEvent[];
}

export interface CommonAddress {
  id: string;
  contact: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  postcode: string;
  address: string;
  isDefault: boolean;
}

export const PROVIDERS: Provider[] = [
  { id: 'LP001', name: '华磊物流', code: 'HUALEI', countries: '美国、加拿大、墨西哥', channels: 6, integration: 'API 对接', status: true, updatedAt: '2026-10-30 10:12:00' },
  { id: 'LP002', name: '云途物流', code: 'YUNEXPRESS', countries: '全球 220+ 国家', channels: 12, integration: 'API 对接', status: true, updatedAt: '2026-10-29 16:20:00' },
  { id: 'LP003', name: '燕文物流', code: 'YANWEN', countries: '欧洲、北美', channels: 8, integration: 'API 对接', status: true, updatedAt: '2026-10-26 11:08:00' },
  { id: 'LP004', name: '递四方', code: '4PX', countries: '全球', channels: 9, integration: 'API 对接', status: true, updatedAt: '2026-10-24 09:35:00' },
  { id: 'LP005', name: '顺丰国际', code: 'SF', countries: '全球', channels: 4, integration: '线下录入', status: false, updatedAt: '2026-10-18 15:42:00' },
  { id: 'LP006', name: 'DHL', code: 'DHL', countries: '全球', channels: 5, integration: 'API 对接', status: true, updatedAt: '2026-10-12 17:05:00' },
  { id: 'LP007', name: 'UPS', code: 'UPS', countries: '全球', channels: 3, integration: 'API 对接', status: true, updatedAt: '2026-10-08 10:30:00' },
  { id: 'LP008', name: 'FedEx', code: 'FEDEX', countries: '全球', channels: 3, integration: '线下录入', status: false, updatedAt: '2026-09-30 14:16:00' },
];

export const CHANNELS: Channel[] = (() => {
  const rng = createRng(20261106);
  const names = ['美国专线', '欧洲专线', '全球挂号', '经济小包', '优先小包', '特快专线'];
  return PROVIDERS.flatMap((provider, providerIndex) =>
    Array.from({ length: providerIndex < 4 ? 3 : 2 }, (_, index) => ({
      id: makeCode('CH', providerIndex * 10 + index, 5),
      provider: provider.name,
      name: `${provider.name.replace('物流', '')}-${names[(providerIndex + index) % names.length]}`,
      eta: `${intBetween(rng, 5, 18)}-${intBetween(rng, 19, 30)} 天`,
      billing: pick(rng, ['实重计费', '体积重计费', '首重+续重']),
      countries: provider.countries,
      status: rng() > 0.25,
    })),
  );
})();

const STATUS_EVENTS: Record<string, string[]> = {
  已上网: ['物流商已揽收', '已到达处理中心'],
  运输中: ['物流商已揽收', '已到达处理中心', '航班已起飞', '已到达目的国'],
  派送中: ['物流商已揽收', '已到达处理中心', '航班已起飞', '已到达目的国', '清关完成', '派送中'],
  已签收: ['物流商已揽收', '已到达处理中心', '航班已起飞', '已到达目的国', '清关完成', '派送中', '已签收'],
  异常: ['物流商已揽收', '地址异常，等待收件人确认'],
};

const SHIPMENT_STATUSES = ['已上网', '运输中', '派送中', '已签收', '异常'];

export const SHIPMENTS: Shipment[] = (() => {
  const rng = createRng(20261107);
  return Array.from({ length: 140 }, (_, index) => {
    const status = pick(rng, SHIPMENT_STATUSES);
    const day = intBetween(rng, -30, 0);
    const events = STATUS_EVENTS[status].map((description, eventIndex) => ({
      time: dayOffset(Math.min(day + eventIndex, 0), intBetween(rng, 8, 21), intBetween(rng, 0, 59)),
      location: description.includes('航班') ? '深圳宝安国际机场' : description.includes('目的国') ? 'Los Angeles, US' : '深圳转运中心',
      description,
    }));
    const provider = pick(rng, PROVIDERS);
    return {
      id: makeCode('SH', index, 6),
      trackingNo: `YT${makeCode('', index + 99000100, 10)}`,
      orderNo: `20${makeCode('', index + 26002000, 8)}`,
      provider: provider.name,
      channel: pick(rng, ['华磊-美国专线', '云途-全球挂号', '燕文-欧洲专线', '递四方-经济小包']),
      country: pick(rng, ['美国', '英国', '德国', '法国', '西班牙', '加拿大']),
      receiver: pick(rng, ['Emily Johnson', 'Michael Brown', 'Sophia Davis', 'James Wilson']),
      lastEvent: events[events.length - 1].description,
      status,
      updatedAt: events[events.length - 1].time,
      events: events.reverse(),
    };
  });
})();

export const COMMON_ADDRESSES: CommonAddress[] = [
  { id: 'CA001', contact: '张伟', phone: '+1 213 555 0188', country: '美国', state: 'California', city: 'Los Angeles', postcode: '90001', address: '1200 Sunset Blvd, Apt 5B', isDefault: true },
  { id: 'CA002', contact: '李娜', phone: '+44 20 7946 0958', country: '英国', state: 'England', city: 'London', postcode: 'EC1A 1BB', address: '10 King Road, Unit 3', isDefault: false },
  { id: 'CA003', contact: '王强', phone: '+49 30 12345678', country: '德国', state: 'Berlin', city: 'Berlin', postcode: '10115', address: 'Friedrichstraße 88', isDefault: false },
  { id: 'CA004', contact: '刘洋', phone: '+33 1 42 68 53 00', country: '法国', state: 'Île-de-France', city: 'Paris', postcode: '75001', address: '15 Rue de Rivoli', isDefault: false },
  { id: 'CA005', contact: '陈晨', phone: '+34 91 123 4567', country: '西班牙', state: 'Madrid', city: 'Madrid', postcode: '28001', address: 'Calle de Alcalá 45', isDefault: false },
  { id: 'CA006', contact: '赵敏', phone: '+1 416 555 0123', country: '加拿大', state: 'Ontario', city: 'Toronto', postcode: 'M5H 2N2', address: '100 King Street West', isDefault: false },
];
