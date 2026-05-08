package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "members")
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String department; // 学部
    private String gender;     // 性別

    @Column(name = "is_active")
    private boolean isActive = true; // 在籍ステータス
}
