package com.example.demo.config;

import com.example.demo.entity.ParkingLot;
import com.example.demo.enums.ParkingLotStatus;
import com.example.demo.enums.ParkingType;
import com.example.demo.repository.ParkingLotRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ParkingConfig {

    @Autowired
    private ParkingLotRepository parkingLotRepository;

    @PostConstruct
    public void initParkingLots() {
        String[] zones = {"A", "B", "C"};

        for (String zone : zones) {
            for (int i = 1; i <= 96; i++) {
                String lotCode = zone + i;

                // Nếu lotCode đã tồn tại thì bỏ qua (tránh tạo trùng khi khởi động lại)
                if (parkingLotRepository.existsByLotCode(lotCode)) continue;

                ParkingLot lot = new ParkingLot();
                lot.setLotCode(lotCode);
                if ("B".equals(zone)) {
                    lot.setType(ParkingType.MOTORBIKE);
                } else {
                    lot.setType(ParkingType.CAR);
                }
                lot.setStatus(ParkingLotStatus.AVAILABLE);
                lot.setPlate("");

                parkingLotRepository.save(lot);
            }
        }
    }
}