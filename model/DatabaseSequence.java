package com.e_ticaret_sitesi.mongodb.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "database_sequences") // MongoDB'deki koleksiyonun adı
@Data
public class DatabaseSequence {
    @Id
    private String id; // Sayacın adı (örn: "kullanici_seq")
    private long seq;  // Sayacın o anki değeri (örn: 1001)
}