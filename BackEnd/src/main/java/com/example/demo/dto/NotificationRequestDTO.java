package com.example.demo.dto;

import java.util.List;

public class NotificationRequestDTO {
    private List<Long> residentIds;
    private String message;

    public List<Long> getResidentIds() {
        return residentIds;
    }

    public void setResidentIds(List<Long> residentIds) {
        this.residentIds = residentIds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}