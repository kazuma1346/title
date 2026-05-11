package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SystemController {

    @GetMapping("/api/status")
    public String getStatus() {
        return "事務処理自動化システムのバックエンド、正常に稼働中！";
    }
}
