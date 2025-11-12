package com.e_ticaret_sitesi.mongodb.repository;

import com.e_ticaret_sitesi.mongodb.model.Kullanici;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KullaniciRepository extends MongoRepository<Kullanici, String> {

    Optional<Kullanici> findByEposta(String eposta);

    Boolean existsByEposta(String eposta);


}
