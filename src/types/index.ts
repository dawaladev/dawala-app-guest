
export interface JenisPaket {
  id: number;
  namaPaket: string;
  namaPaketEn?: string;
}


export interface Makanan {
  id: number;
  namaMakanan: string;
  deskripsi: string;
  deskripsiEn?: string;
  foto: string[];
  harga: number;
  jenisPaketId: number;
  jenisPaket?: JenisPaket;
}
