package com.e_ticaret_sitesi.mongodb.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "siparisler")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Siparis {

    @Id
    private String id;

    @Indexed(unique = true)
    private Long siparisNo;

    @NotBlank
    private String kullaniciId;

    @NotNull
    private Long kullaniciNo; // Sizin "5" gibi sıralı numaranız

    private String kullaniciEposta; // Hız için e-postayı da kopyalayabiliriz

    @NotEmpty
    private List<SiparisUrunu> urunler;

    @NotNull
    private Double toplamTutar;

    @NotBlank
    private String durum;

    @CreatedDate
    private LocalDateTime siparisTarihi;

    @NotNull
    private Kullanici.Adres teslimatAdresi;


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SiparisUrunu {
        @NotBlank
        private String urunId;
        @NotBlank
        private String urunAdi;
        @NotNull
        private Integer miktar;
        @NotNull
        private Double fiyat;
    }
}