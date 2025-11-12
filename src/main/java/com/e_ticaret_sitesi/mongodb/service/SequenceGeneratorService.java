package com.e_ticaret_sitesi.mongodb.service;

import com.e_ticaret_sitesi.mongodb.model.DatabaseSequence;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.Objects;

// MongoDB'nin FindAndModify özelliğini kullanmak için statik importlar
import static org.springframework.data.mongodb.core.FindAndModifyOptions.options;
import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Service
@RequiredArgsConstructor
public class SequenceGeneratorService {

    // MongoTemplate'in üst sınıfıdır, daha geneldir
    private final MongoOperations mongoOperations;

    public long generateSequence(String seqName) {

        // 1. "database_sequences" koleksiyonunda 'seqName' id'li belgeyi bul
        // 2. 'seq' alanını 1 artır ($inc)
        // 3. options().returnNew(true) -> bana artırılmış YENİ değeri döndür
        // 4. options().upsert(true) -> eğer böyle bir 'seqName' yoksa, onu oluştur
        DatabaseSequence counter = mongoOperations.findAndModify(
                query(where("_id").is(seqName)),
                new Update().inc("seq", 1),
                options().returnNew(true).upsert(true),
                DatabaseSequence.class);

        // Eğer sayaç boş değilse 'seq' değerini, boşsa (ilk defa oluşuyorsa) 1 döndür
        return !Objects.isNull(counter) ? counter.getSeq() : 1;
    }
}