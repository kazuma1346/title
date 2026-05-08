package com.example.demo.service;

import com.example.demo.entity.Event;
import com.example.demo.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    /** 全イベントを取得 */
    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    /** IDでイベントを1件取得 */
    public Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }

    /** イベントを新規作成 */
    public Event create(Event event) {
        return eventRepository.save(event);
    }

    /** イベント情報を更新 */
    public Event update(Long id, Event updated) {
        Event existing = findById(id);
        existing.setTitle(updated.getTitle());
        existing.setBaseCost(updated.getBaseCost());
        existing.setAdminFeePerPerson(updated.getAdminFeePerPerson());
        existing.setLocked(updated.isLocked());
        return eventRepository.save(existing);
    }

    /** イベントを削除 */
    public void delete(Long id) {
        eventRepository.deleteById(id);
    }

    /**
     * 1人あたりの徴収額を計算する
     * （実費総額 ÷ 参加者人数）+ 運営費
     */
    public int calcFeePerPerson(Event event, int attendedCount) {
        if (attendedCount == 0) return 0;
        return (event.getBaseCost() / attendedCount) + event.getAdminFeePerPerson();
    }
}
