package com.campusfind;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ItemController {
    private final ItemRepository repository;

    public ItemController(ItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Item> all(@RequestParam(required = false) String status) {
        if (status == null || status.isBlank()) {
            return repository.findAll();
        }
        String normalized = status.trim().toUpperCase();
        if (!normalized.equals("LOST") && !normalized.equals("FOUND")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be LOST or FOUND");
        }
        return repository.findByStatusIgnoreCaseOrderByCreatedAtDesc(normalized);
    }

    @GetMapping("/{id}")
    public Item one(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item create(@Valid @RequestBody Item item) {
        item.setId(null);
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Item update(@PathVariable Long id, @Valid @RequestBody Item updated) {
        Item item = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));
        item.setTitle(updated.getTitle());
        item.setDescription(updated.getDescription());
        item.setCategory(updated.getCategory());
        item.setLocation(updated.getLocation());
        item.setContact(updated.getContact());
        item.setStatus(updated.getStatus());
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
        }
        repository.deleteById(id);
    }
}
