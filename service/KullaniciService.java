package com.e_ticaret_sitesi.mongodb.service;

import com.e_ticaret_sitesi.mongodb.model.Kullanici;
import com.e_ticaret_sitesi.mongodb.repository.KullaniciRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder; // Çözüldü
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KullaniciService {

    private final KullaniciRepository kullaniciRepository;

    
    private final PasswordEncoder passwordEncoder;
    private final SequenceGeneratorService sequenceGenerator;
    // ==================================

    // Sayaç koleksiyonu için bir isim sabiti
    public static final String KULLANICI_SEQUENCE_NAME = "kullanici_seq";

    // Tüm kullanıcıları getir
    public List<Kullanici> tumKullanicilariGetir() {
        return kullaniciRepository.findAll();
    }

    // ID'ye göre kullanıcı getir
    public Optional<Kullanici> kullaniciGetir(String id) {
        return kullaniciRepository.findById(id);
    }

    // Yeni kullanıcı kaydet (GÜNCELLENDİ)
    public Kullanici kullaniciKaydet(Kullanici kullanici) {
        if (kullaniciRepository.existsByEposta(kullanici.getEposta())) {
            throw new RuntimeException("Bu e-posta adresi zaten kullanılıyor!");
        }

        // 1. ŞİFREYİ HASH'LE (Güvenlik sorunu çözüldü)
        kullanici.setSifre(passwordEncoder.encode(kullanici.getSifre()));

        // 2. SIRALI KULLANICI NO OLUŞTUR (Sıralı ID sorunu çözüldü)
        kullanici.setKullaniciNo(sequenceGenerator.generateSequence(KULLANICI_SEQUENCE_NAME));

        // 3. Diğer varsayılan değerleri ata
        kullanici.setKayitTarihi(LocalDateTime.now());
        kullanici.setAktifMi(true);

        // 4. Veritabanına kaydet
        return kullaniciRepository.save(kullanici);
    }

    // Kullanıcı girişi (GÜNCELLENDİ)
    public Optional<Kullanici> kullaniciGirisi(String eposta, String sifre) {
        Optional<Kullanici> kullanici = kullaniciRepository.findByEposta(eposta);

        // Giriş şifresi (sifre) ile DB'deki hash'lenmiş şifre (kullanici.getSifre()) eşleşiyor mu?
        if (kullanici.isPresent() && passwordEncoder.matches(sifre, kullanici.get().getSifre())) {
            return kullanici;
            // BURADA BİR SONRAKİ ADIM JWT TOKEN ÜRETMEK OLMALI
        }

        return Optional.empty();
    }
}