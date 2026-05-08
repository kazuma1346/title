package com.example.demo.service;

import org.springframework.stereotype.Service;

@Service
public class AccountingService {

    /**
     * 1人あたりの徴収額を計算する
     *
     * @param baseCost  実費総額（交通費・会場費など）
     * @param count     参加人数
     * @param adminFee  1人あたりのサークル運営費
     * @return 1人あたりの徴収額
     */
    public int calculatePerPersonFee(int baseCost, int count, int adminFee) {
        if (count <= 0) return 0;
        return (baseCost / count) + adminFee;
    }
}
