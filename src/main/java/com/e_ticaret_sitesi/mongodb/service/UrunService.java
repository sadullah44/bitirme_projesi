package com.e_ticaret_sitesi.mongodb.service;

import com.e_ticaret_sitesi.mongodb.model.Urun;
import com.e_ticaret_sitesi.mongodb.repository.UrunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page; // Sayfalama için
import org.springframework.data.domain.Pageable; // Sayfalama için
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.util.ArrayList;
import java.util.List;
import java.time.Instant;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UrunService {

    private final UrunRepository urunRepository;
    private final MongoTemplate mongoTemplate;
    /**
     * Tüm ürünleri sayfalayarak getirir. (Hafta 3 - Genel API)
     * @param pageable Sayfa numarası, sayfa boyutu, sıralama bilgileri
     * @return Ürünlerin bir sayfası
     */
    public Page<Urun> tumUrunleriGetir(Pageable pageable) {
        // findAll metodu Pageable parametresi aldığında
        // veritabanından sadece o sayfaya ait veriyi çeker.
        return urunRepository.findAll(pageable);
    }

    /**
     * ID'ye göre tek bir ürünü getirir. (Hafta 3 - Genel API)
     * @param id Ürünün MongoDB ObjectId'si
     * @return Bulunursa Ürün, bulunamazsa Optional.empty()
     */
    public Optional<Urun> urunGetir(String id) {
        return urunRepository.findById(id);
    }

    /**
     * Yeni bir ürün kaydeder. (Hafta 3 - Admin CRUD)
     * @param urun Kaydedilecek ürün nesnesi
     * @return Kaydedilen ürün nesnesi
     */
    public Urun urunKaydet(Urun urun) {
        // Ürünün eklenme tarihini şu an olarak ayarla
        urun.setEklenmeTarihi(Instant.now());

        // Eğer fiyat geçmişi boşsa, ilk fiyatı ekle
        if (urun.getFiyatGecmisi() == null || urun.getFiyatGecmisi().isEmpty()) {
            Urun.FiyatGecmisi ilkFiyat = new Urun.FiyatGecmisi(
                    null, // Eski fiyat yok
                    urun.getFiyat(),
                    Instant.now()
            );
            urun.getFiyatGecmisi().add(ilkFiyat);
        }

        return urunRepository.save(urun);
    }
    /**
     * Bir ürün listesini toplu olarak kaydeder. (Hafta 3 - Toplu Ekleme)
     * @param urunler Kaydedilecek ürünlerin listesi
     * @return Kaydedilen ürünlerin listesi
     */
    public List<Urun> topluUrunKaydet(List<Urun> urunler) {

        // 1. Listenin içindeki her bir ürünü döngüye al
        for (Urun urun : urunler) {

            // 2. Tıpkı tekil kayıttaki gibi mantığı uygula
            urun.setEklenmeTarihi(Instant.now());

            // 3. Fiyat geçmişini ayarla
            if (urun.getFiyatGecmisi() == null || urun.getFiyatGecmisi().isEmpty()) {
                Urun.FiyatGecmisi ilkFiyat = new Urun.FiyatGecmisi(
                        null,
                        urun.getFiyat(),
                        Instant.now()
                );
                urun.getFiyatGecmisi().add(ilkFiyat);
            }
        }

        // 4. Hazırlanmış listeyi, veritabanına TEK BİR OPERASYONDA kaydet
        // Bu, döngü içinde tek tek save() yapmaktan çok daha hızlıdır.
        return urunRepository.saveAll(urunler);
    }

    public Optional<Urun> urunGuncelle(String id, Urun guncelUrunBilgisi) {

        // 1. Orijinal ürünü veritabanından bul
        Optional<Urun> opsiyonelOrijinalUrun = urunRepository.findById(id);

        // 2. Ürün bulunamazsa, boş 'Optional' döndür
        if (opsiyonelOrijinalUrun.isEmpty()) {
            return Optional.empty();
        }

        // 3. Ürün bulunduysa, orijinal nesneyi al
        Urun orijinalUrun = opsiyonelOrijinalUrun.get();

        // Gelen yeni bilgilerin fiyatı (null olabilir)
        Double yeniFiyat = guncelUrunBilgisi.getFiyat();
        // Veritabanındaki eski fiyat (null olabilir)
        Double eskiFiyat = orijinalUrun.getFiyat();

        // 4. Fiyat değişikliğini GÜVENLİ bir şekilde kontrol et (DÜZELTİLDİ)
        // Objects.equals() her iki taraf null ise true,
        // biri null diğeri değilse false,
        // ikisi de doluysa .equals() ile karşılaştırma yapar.
        if (!java.util.Objects.equals(eskiFiyat, yeniFiyat)) {

            // Fiyat gerçekten değişmişse (veya ilk kez atanıyorsa)
            // Fiyat geçmişi için yeni bir kayıt oluştur
            Urun.FiyatGecmisi fiyatDegisikligi = new Urun.FiyatGecmisi(
                    eskiFiyat, // Eski fiyat (null olabilir)
                    yeniFiyat, // Yeni fiyat
                    Instant.now()
            );

            // Yeni değişikliği 'fiyatGecmisi' listesine ekle
            orijinalUrun.getFiyatGecmisi().add(fiyatDegisikligi);

            // Fiyatı da güncelle
            orijinalUrun.setFiyat(yeniFiyat);
        }

        // 5. Orijinal ürünün diğer alanlarını yeni bilgilerle güncelle
        orijinalUrun.setIsim(guncelUrunBilgisi.getIsim());
        orijinalUrun.setAciklama(guncelUrunBilgisi.getAciklama());
        orijinalUrun.setStok(guncelUrunBilgisi.getStok());
        orijinalUrun.setKategori(guncelUrunBilgisi.getKategori());
        orijinalUrun.setMarka(guncelUrunBilgisi.getMarka());

        // 6. Güncellenmiş 'orijinalUrun' nesnesini kaydet ve döndür
        return Optional.of(urunRepository.save(orijinalUrun));
    }

    public boolean urunSil(String id) {

        // 1. Silinmek istenen ID'li ürün veritabanında var mı diye kontrol et
        if (!urunRepository.existsById(id)) {
            // Ürün yoksa 'false' döndür (Controller bunu 404'e çevirecek)
            return false;
        }

        // 2. Ürün varsa, ID'ye göre sil
        urunRepository.deleteById(id);

        // 3. Silme işlemi başarılı, 'true' döndür
        return true;
    }

    public Page<Urun> filtreleUrunler(Pageable pageable, String kategori, Double minFiyat, Double maxFiyat) {

        // 1. Ana sorgu nesnesini oluştur
        Query query = new Query();

        // 2. Kriter listesini (filtre kurallarını) tutacak bir liste oluştur
        List<Criteria> criteriaList = new ArrayList<>();

        // 3. Hangi filtreler doluysa, kriter listesine ekle
        if (kategori != null && !kategori.isBlank()) {
            criteriaList.add(Criteria.where("kategori").is(kategori));
        }

        if (minFiyat != null) {
            criteriaList.add(Criteria.where("fiyat").gte(minFiyat)); // gte = Greater Than or Equal (>=)
        }

        if (maxFiyat != null) {
            criteriaList.add(Criteria.where("fiyat").lte(maxFiyat)); // lte = Less Than or Equal (<=)
        }

        // 4. Eğer kriter listesinde en az bir kural varsa
        if (!criteriaList.isEmpty()) {
            // Tüm kuralları 'AND' (VE) operatörü ile birleştir ve ana sorguya ekle
            // Örn: (kategori = 'Elektronik') AND (fiyat <= 50000)
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // 5. Sayfalama olmadan, bu filtrelere uyan toplam eleman sayısını bul
        // Bu, toplam sayfa sayısını hesaplamak için gereklidir.
        long count = mongoTemplate.count(query, Urun.class);

        // 6. Şimdi asıl sorguya sayfalama ve sıralama kurallarını ekle
        query.with(pageable);

        // 7. Sorguyu çalıştır ve filtrelenmiş + sayfalama yapılmış ürün listesini al
        List<Urun> urunler = mongoTemplate.find(query, Urun.class);

        // 8. Sonuçları bir 'Page' nesnesi olarak döndür
        return new PageImpl<>(urunler, pageable, count);
    }
    public Page<Urun> urunleriMetneGoreAra(String aramaMetni, Pageable pageable) {

        // 1. UrunRepository'de @Query ile tanımladığımız
        //    'metinAramasiYap' metodunu çağırıyoruz.
        //    IDE'deki uyarıya rağmen bu kod çalışacaktır.
        return urunRepository.metinAramasiYap(aramaMetni, pageable);
    }
}