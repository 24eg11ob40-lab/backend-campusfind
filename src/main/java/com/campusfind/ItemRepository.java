package com.campusfind;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);
}
