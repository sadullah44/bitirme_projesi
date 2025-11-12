package com.e_ticaret_sitesi.mongodb.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "urunler")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Urun {

    @Id
    private String id; // MongoDB'nin ObjectId'si

    @NotBlank
    @Size(min = 3)
    @TextIndexed // Hafta 3'teki arama API'si için şimdiden işaretliyoruz
    private String isim;

    @TextIndexed
    private String aciklama;

    @NotNull
    @Min(value = 0)
    private Double fiyat;

    @NotNull
    @Min(value = 0)
    private Integer stok;
    @TextIndexed
    private String kategori;
    @TextIndexed
    private String marka;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone = "Europe/Istanbul")
    private Instant eklenmeTarihi;

    // Kapsam: "yorumlar (gömülü dizi)"
    private List<Yorum> yorumlar = new ArrayList<>();

    // Kapsam: "fiyat geçmişi (dizi)"
    private List<FiyatGecmisi> fiyatGecmisi = new ArrayList<>();


    // === İç Sınıflar (Gömülü Belgeler) ===

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Yorum {
        private String kullaniciId;
        private String kullaniciAdi; // Denormalizasyon (hız için)
        @NotNull
        private Integer puan; // 1-5
        private String metin;
        private Instant tarih;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FiyatGecmisi {
        private Double eskiFiyat;
        private Double yeniFiyat;
        @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone = "Europe/Istanbul")
        private Instant degisimTarihi;
    }
}