package com.e_ticaret_sitesi.mongodb.repository;

import com.e_ticaret_sitesi.mongodb.model.Urun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

// 'Urun' modelini ve ID'sinin tipini ('String') belirtiyoruz
@Repository
public interface UrunRepository extends MongoRepository<Urun, String> {

    @Query("{ $text: { $search: ?0 } }")
    Page<Urun> metinAramasiYap(String aramaMetni, Pageable pageable);
}