package com.example.demo.config;

import com.example.demo.entity.Apartment;
import com.example.demo.enums.ApartmentStatus;
import com.example.demo.enums.ApartmentType;
import com.example.demo.repository.ApartmentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Configuration
public class ApartmentConfig {

    @Autowired
    private ApartmentRepository apartmentRepository;

    private Random random = new Random();

    @PostConstruct
    @Transactional
    public void initApartments() {
        if (apartmentRepository.count() > 0) {
            System.out.println("Apartments đã được khởi tạo trước đó.");
            return;
        }

        List<Apartment> apartments = new ArrayList<>();

        int apartmentCounter = 1;

        for (int floor = 1; floor <= 10; floor++) {
            for (int i = 1; i <= 5; i++) {
                Apartment apartment = new Apartment();

                // Format: A0001 -> A0150
                String apartmentNumber = String.format("A%04d", apartmentCounter++);
                apartment.setApartmentNumber(apartmentNumber);
                apartment.setFloor(floor);

                // Xác định loại căn hộ theo tầng
                ApartmentType type;
                double area;
                int roomCount;
                if (floor == 1) {
                    type = ApartmentType.KIOT;
                    area = 20 + random.nextInt(21); // 20–40 m²
                    roomCount = 1;
                } else if (floor == 15) {
                    type = ApartmentType.PENHOUSE;
                    area = 100 + random.nextInt(51); // 100–150 m²
                    roomCount = 3 + random.nextInt(3); // 3–5 phòng
                } else {
                    type = ApartmentType.STANDARD;
                    area = 45 + random.nextInt(46); // 45–90 m²
                    roomCount = 2 + random.nextInt(2); // 2–3 phòng
                }

                apartment.setType(type);
                apartment.setArea(area);
                apartment.setRoomNumber(String.valueOf(roomCount));

                // Random trạng thái
                ApartmentStatus status = ApartmentStatus.VACANT;
                apartment.setStatus(status);
                System.out.println("status = " + status);

                apartment.setBillIds(new HashSet<>());
                apartment.setResidentIds(new HashSet<>());

                apartments.add(apartment);
            }
        }

        apartmentRepository.saveAll(apartments);
        System.out.println("Đã khởi tạo 150 căn hộ!");
    }
}
