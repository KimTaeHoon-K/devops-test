export interface KeyPairListType {
  keyPairs: KeyPairType[];
}

export interface KeyPairType {
  id: string;
  name: string;
  fingerprint: string;
  createdAt: string;
}
