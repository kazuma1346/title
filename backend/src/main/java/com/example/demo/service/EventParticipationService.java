package com.example.demo.service;

import com.example.demo.entity.Event;
import com.example.demo.entity.EventParticipation;
import com.example.demo.entity.Member;
import com.example.demo.repository.EventParticipationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventParticipationService {

    private final EventParticipationRepository participationRepository;
    private final EventService eventService;
    private final MemberService memberService;

    /** イベントに紐づく参加レコードを全件取得 */
    public List<EventParticipation> findByEvent(Long eventId) {
        Event event = eventService.findById(eventId);
        return participationRepository.findByEvent(event);
    }

    /**
     * 出席ステータスを更新する
     * 存在しなければ新規作成（upsert）
     */
    public EventParticipation updateAttendance(Long eventId, Long memberId, boolean isAttended) {
        Event event = eventService.findById(eventId);
        Member member = memberService.findById(memberId);

        EventParticipation participation = participationRepository
                .findByEventAndMember(event, member)
                .orElseGet(() -> {
                    EventParticipation ep = new EventParticipation();
                    ep.setEvent(event);
                    ep.setMember(member);
                    return ep;
                });

        participation.setAttended(isAttended);
        // 欠席に戻した場合は支払いステータスもリセット
        if (!isAttended) {
            participation.setPaid(false);
            participation.setAmountPaid(0);
        }
        return participationRepository.save(participation);
    }

    /**
     * 支払いステータスを更新する
     * 出席していない場合は更新不可
     */
    public EventParticipation updatePayment(Long eventId, Long memberId, boolean isPaid, int amountPaid) {
        Event event = eventService.findById(eventId);
        Member member = memberService.findById(memberId);

        EventParticipation participation = participationRepository
                .findByEventAndMember(event, member)
                .orElseThrow(() -> new RuntimeException("参加レコードが見つかりません。先に出席登録してください。"));

        if (!participation.isAttended()) {
            throw new RuntimeException("出席していないメンバーの支払いは更新できません。");
        }

        participation.setPaid(isPaid);
        participation.setAmountPaid(amountPaid);
        return participationRepository.save(participation);
    }

    /**
     * イベントのサマリーを計算して返す
     * - 出席人数
     * - 支払済人数
     * - 回収予定額（理論値）
     * - 実際回収済額
     * - 差額
     */
    public EventSummary calcSummary(Long eventId) {
        Event event = eventService.findById(eventId);
        List<EventParticipation> list = participationRepository.findByEvent(event);

        long attendedCount = list.stream().filter(EventParticipation::isAttended).count();
        long paidCount     = list.stream().filter(EventParticipation::isPaid).count();
        int  actualTotal   = list.stream().mapToInt(EventParticipation::getAmountPaid).sum();
        int  feePerPerson  = eventService.calcFeePerPerson(event, (int) attendedCount);
        int  expectedTotal = feePerPerson * (int) attendedCount;
        int  difference    = actualTotal - expectedTotal;

        return new EventSummary(attendedCount, paidCount, expectedTotal, actualTotal, difference, feePerPerson);
    }

    /** サマリーDTO（内部レコードクラス） */
    public record EventSummary(
            long attendedCount,
            long paidCount,
            int  expectedTotal,
            int  actualTotal,
            int  difference,
            int  feePerPerson
    ) {}
}
