package com.example.demo.service;

import com.example.demo.entity.Member;
import com.example.demo.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    /** 全部員を取得 */
    public List<Member> findAll() {
        return memberRepository.findAll();
    }

    /** IDで部員を1件取得 */
    public Member findById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found: " + id));
    }

    /** 部員を新規登録 */
    public Member create(Member member) {
        return memberRepository.save(member);
    }

    /** 部員情報を更新 */
    public Member update(Long id, Member updated) {
        Member existing = findById(id);
        existing.setName(updated.getName());
        existing.setDepartment(updated.getDepartment());
        existing.setGender(updated.getGender());
        existing.setActive(updated.isActive());
        return memberRepository.save(existing);
    }

    /** 部員を削除 */
    public void delete(Long id) {
        memberRepository.deleteById(id);
    }
}
