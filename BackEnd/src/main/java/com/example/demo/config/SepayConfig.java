package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SepayConfig {

    @Value("${sepay.api.url}")
    private String apiUrl;
    
    @Value("${sepay.api.token}")
    private String apiToken;
    
    @Value("${sepay.account.number}")
    private String accountNumber;
    
    @Value("${sepay.account.name}")
    private String accountName;
    
    @Value("${sepay.account.bank}")
    private String accountBank;

    @Value("${sepay.ip.allow}")
    private String ipAllow;

    public String getIpAllow() {
        return ipAllow;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public String getApiToken() {
        return apiToken;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    public String getAccountBank() {
        return accountBank;
    }
} 