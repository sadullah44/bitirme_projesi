package com.e_ticaret_sitesi.mongodb.controller;

import com.e_ticaret_sitesi.mongodb.model.Urun;
import com.e_ticaret_sitesi.mongodb.service.UrunService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UrunController {

    private final UrunService urunService;

    @PostMapping("/urun-ekle") // 2. DEĞİŞİKLİK: Metodun adresi "/urun-ekle" oldu
    public ResponseEntity<Urun> urunEkle(@Valid @RequestBody Urun urun) {
        Urun yeniUrun = urunService.urunKaydet(urun);
        return ResponseEntity.status(HttpStatus.CREATED).body(yeniUrun);
    }
    /**
     * YENİ ÜRÜNLERİ TOPLU EKLEME (Test Verisi için)
     * YENİ ADRES: POST http://localhost:8080/api/urunler/toplu-ekle
     */
    @PostMapping("/toplu-urun-ekle") // 8. DEĞİŞİKLİK: Yeni adres
    public ResponseEntity<List<Urun>> topluUrunEkle(@Valid @RequestBody List<Urun> urunler) {

        // Yeni servis metodunu çağır
        List<Urun> kaydedilenUrunler = urunService.topluUrunKaydet(urunler);

        return ResponseEntity.status(HttpStatus.CREATED).body(kaydedilenUrunler);
    }

    /**
     * TÜM ÜRÜNLERİ LİSTELEME (Sayfalama ile)
     * YENİ ADRES: GET http://localhost:8080/api/urunler
     */
    @GetMapping("/urunler") // 3. DEĞİŞİKLİK: Metodun adresi "/urunler" oldu
    public ResponseEntity<Page<Urun>> tumUrunleriGetir(Pageable pageable) {
        Page<Urun> urunlerSayfasi = urunService.tumUrunleriGetir(pageable);
        return ResponseEntity.ok(urunlerSayfasi);
    }

    /**
     * TEK BİR ÜRÜNÜ GETİRME
     * YENİ ADRES: GET http://localhost:8080/api/urunler/{id}
     */
    @GetMapping("/urunler/{id}") // 4. DEĞİŞİKLİK: Metodun adresi "/urunler/{id}" oldu
    public ResponseEntity<Urun> urunGetir(@PathVariable String id) {
        return urunService.urunGetir(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * MEVCUT BİR ÜRÜNÜ GÜNCELLEME (Admin Paneli için)
     * YENİ ADRES: PUT http://localhost:8080/api/urunler/{id}
     * Bu API, SecurityConfig'de koruma altında olmalı (authenticated())
     */
    @PutMapping("/urunler/{id}") // 5. DEĞİŞİKLİK: PUT isteğini bu adrese eşle
    public ResponseEntity<Urun> urunGuncelle(
            @PathVariable String id,
            @Valid @RequestBody Urun guncelUrunBilgisi) {

        // UrunService'deki yeni metodu çağırıyoruz
        return urunService.urunGuncelle(id, guncelUrunBilgisi)
                .map(ResponseEntity::ok) // Başarılı olursa (Optional doluysa) 200 OK ve güncel ürünü döndür
                .orElse(ResponseEntity.notFound().build()); // Başarısız olursa (Optional boşsa) 404 Not Found döndür
    }

    @DeleteMapping("/urunler/{id}") // 6. DEĞİŞİKLİK: DELETE isteğini bu adrese eşle
    public ResponseEntity<Void> urunSil(@PathVariable String id) {

        // UrunService'deki yeni metodu çağırıyoruz
        boolean silindi = urunService.urunSil(id);

        if (silindi) {
            // Silme başarılıysa, 204 No Content (İçerik Yok) döndür.
            // Bu, 'silme başarılı' demenin standart yoludur.
            return ResponseEntity.noContent().build();
        } else {
            // Silme başarısızsa (ürün bulunamadıysa), 404 Not Found döndür.
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * ÜRÜNLERİ FİLTRELEME (Genel Vitrin için)
     * YENİ ADRES: GET http://localhost:8080/api/urunler/filtrele
     * Örnek: .../filtrele?kategori=Elektronik&minFiyat=10000&maxFiyat=50000&page=0&size=10
     * Bu API, SecurityConfig'de herkese açık olmalı (permitAll())
     */
    @GetMapping("/urunler/filtrele") // 7. DEĞİŞİKLİK: Filtreleme adresini ekle
    public ResponseEntity<Page<Urun>> filtreleUrunler(

            // @RequestParam: URL'deki ?kategori=... parametresini okur
            // required = false: Bu parametre gelmezse 'null' olarak kabul et (zorunlu değil)
            @RequestParam(required = false) String kategori,
            @RequestParam(required = false) Double minFiyat,
            @RequestParam(required = false) Double maxFiyat,

            // Pageable: Spring'in ?page=0&size=10&sort=fiyat,asc
            // parametrelerini otomatik olarak algılamasını sağlar
            Pageable pageable) {

        // UrunService'deki yeni filtreleUrunler metodunu çağırıyoruz
        Page<Urun> urunlerSayfasi = urunService.filtreleUrunler(pageable, kategori, minFiyat, maxFiyat);

        // Filtrelenmiş ve sayfalanmış sonuçları 200 OK olarak döndür
        return ResponseEntity.ok(urunlerSayfasi);
    }

    @GetMapping("/urunler/ara") // 9. DEĞİŞİKLİK: Arama adresini ekle
    public ResponseEntity<Page<Urun>> urunleriMetneGoreAra(

            // @RequestParam(name = "q"): URL'deki ?q=... parametresini okur
            // (Arama sorguları için 'q' harfini kullanmak yaygın bir standarttır)
            @RequestParam(name = "q") String aramaMetni,

            // Pageable: ?page=0&size=10 parametrelerini alır
            Pageable pageable) {

        // UrunService'deki yeni arama metodunu çağırıyoruz
        Page<Urun> bulunanUrunler = urunService.urunleriMetneGoreAra(aramaMetni, pageable);

        // Bulunan sonuçları 200 OK olarak döndür
        return ResponseEntity.ok(bulunanUrunler);
    }
}