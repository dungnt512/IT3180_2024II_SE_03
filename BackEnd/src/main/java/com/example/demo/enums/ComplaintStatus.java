package com.example.demo.enums;

public enum ComplaintStatus {
    PENDING("Đang chờ xử lý"),
    IN_PROGRESS("Đang xử lý"),
    RESOLVED("Đã giải quyết"),
    REJECTED("Đã từ chối");

    private final String displayName;

    ComplaintStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}