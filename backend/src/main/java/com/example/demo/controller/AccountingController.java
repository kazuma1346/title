package com.example.demo.controller;

import com.example.demo.entity.Event;
import com.example.demo.entity.EventParticipation;
import com.example.demo.entity.Member;
import com.example.demo.repository.EventParticipationRepository;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.MemberRepository;
import com.example.demo.service.AccountingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // 開発用にすべてのフロントエンドからのアクセスを許可
public class AccountingController {

    private final MemberRepository memberRepository;
    private final EventRepository eventRepository;
    private final EventParticipationRepository participationRepository;
    private final AccountingService accountingService;

    // コンストラクタ・インジェクション
    public AccountingController(MemberRepository memberRepository,
                                EventRepository eventRepository,
                                EventParticipationRepository participationRepository,
                                AccountingService accountingService) {
        this.memberRepository = memberRepository;
        this.eventRepository = eventRepository;
        this.participationRepository = participationRepository;
        this.accountingService = accountingService;
    }

    // 1. 名簿一覧を取得 (Reactのリスト描画用)
    @GetMapping("/members")
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    // 2. イベント一覧を取得
    @GetMapping("/events")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // 3. 新規イベントを作成
    @PostMapping("/events")
    public Event createEvent(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    // 4. 特定のイベントの参加・集金状況を取得
    @GetMapping("/events/{eventId}/participations")
    public List<EventParticipation> getParticipations(@PathVariable Long eventId) {
        return participationRepository.findByEventId(eventId);
    }

    // 5. 1人あたりの徴収額をシミュレーション（Serviceの計算ロジックを使用）
    @GetMapping("/calculate-fee")
    public Map<String, Integer> calculateFee(
            @RequestParam int baseCost,
            @RequestParam int count,
            @RequestParam int adminFee) {

        int fee = accountingService.calculatePerPersonFee(baseCost, count, adminFee);
        return Map.of("perPersonFee", fee);
    }
}
