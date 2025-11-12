package com.e_ticaret_sitesi.mongodb.model;

import jakarta.validation.constraints.Email; // Validation
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed; // Benzersiz alan için
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty; // Şifreyi JSON'da gizlemek için

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "kullanicilar")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Kullanici {

    @Id
    private String id;


    @Indexed(unique = true) // Bu da benzersiz olmalı
    private Long kullaniciNo;

    @NotBlank
    private String ad;

    @NotBlank
    private String soyad;

    @NotBlank
    @Email // E-posta formatını doğrular
    @Indexed(unique = true) // E-postanın benzersiz olmasını sağlar
    private String eposta;

    @NotBlank
    @Size(min = 6)
    // Şifreyi API response'larında (JSON) göstermemek için
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String sifre; // Service katmanında BCrypt ile hash'lenecek

    private String telefon;
    private LocalDateTime kayitTarihi;
    private Boolean aktifMi;

    // Hafta 1 - Gömülü Adresler (Bu kısım güzeldi)
    private List<Adres> adresler = new ArrayList<>();

    // Hafta 4 - Sepet
    private List<SepetUrunu> sepet = new ArrayList<>();

    // Hafta 5 - Sipariş Geçmişi (Sadece Sipariş ID'lerini tutmak daha verimli)
    private List<String> siparisGecmisi = new ArrayList<>();

    // Hafta 6 - Öneri Motoru için (Sadece Ürün ID'lerini tut)
    private List<String> gozAtmaGecmisi = new ArrayList<>();

    // --- İç Sınıflar (Embedded) ---

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Adres {
        private String baslik;
        private String adresSatiri;
        private String sehir;
        private String ilce;
        private String postaKodu;
        private Boolean varsayilanMi;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SepetUrunu {
        private String urunId; // Ürün koleksiyonuna referans
        private int miktar;
        private double fiyat; // Sepete ekleme anındaki fiyat (opsiyonel ama önerilir)
    }
}