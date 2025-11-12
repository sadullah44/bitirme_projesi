package com.e_ticaret_sitesi.mongodb.controller;

import com.e_ticaret_sitesi.mongodb.model.Kullanici;
import com.e_ticaret_sitesi.mongodb.service.KullaniciService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/kullanicilar")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KullaniciController {
    private final KullaniciService kullaniciService;

    // Tüm kullanıcıları getir
    @GetMapping
    public ResponseEntity<List<Kullanici>> tumKullanicilariGetir() {
        return ResponseEntity.ok(kullaniciService.tumKullanicilariGetir());
    }

    // ID'ye göre kullanıcı getir
    @GetMapping("/{id}")
    public ResponseEntity<Kullanici> kullaniciGetir(@PathVariable String id) {
        return kullaniciService.kullaniciGetir(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Yeni kullanıcı kaydet
    @PostMapping("/kayit")
    public ResponseEntity<?> kullaniciKaydet(@RequestBody Kullanici kullanici) {
        try {
            Kullanici yeniKullanici = kullaniciService.kullaniciKaydet(kullanici);
            return ResponseEntity.status(HttpStatus.CREATED).body(yeniKullanici);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("hata", e.getMessage()));
        }
    }

    // Kullanıcı girişi
    @PostMapping("/giris")
    public ResponseEntity<?> kullaniciGirisi(@RequestBody Map<String, String> girisInfo) {
        String eposta = girisInfo.get("eposta");
        String sifre = girisInfo.get("sifre");

        return kullaniciService.kullaniciGirisi(eposta, sifre)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(null));
    }


}
