package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "base_cost")
    private int baseCost; // 実費総額

    @Column(name = "admin_fee_per_person")
    private int adminFeePerPerson; // 1人あたりのサークル運営費

    @Column(name = "is_locked")
    private boolean isLocked = false; // 精算完了フラグ
}
