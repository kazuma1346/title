package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "event_participations")
public class EventParticipation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "is_attended")
    private boolean isAttended = false;

    @Column(name = "is_paid")
    private boolean isPaid = false;

    @Column(name = "amount_paid")
    private int amountPaid = 0;
}
