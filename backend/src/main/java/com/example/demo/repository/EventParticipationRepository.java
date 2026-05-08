package com.example.demo.repository;

import com.example.demo.entity.EventParticipation;
import com.example.demo.entity.Event;
import com.example.demo.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipationRepository extends JpaRepository<EventParticipation, Long> {

    // イベントエンティティで検索
    List<EventParticipation> findByEvent(Event event);

    // イベントIDで検索（Controllerから直接使用）
    List<EventParticipation> findByEventId(Long eventId);

    // 特定のイベント×メンバーのレコードを1件取得
    Optional<EventParticipation> findByEventAndMember(Event event, Member member);
}
