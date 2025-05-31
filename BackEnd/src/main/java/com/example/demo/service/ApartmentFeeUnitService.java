package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.ApartmentFeeUnit;
import com.example.demo.repository.ApartmentFeeUnitRepository;

@Service
public class ApartmentFeeUnitService {

    @Autowired
    private ApartmentFeeUnitRepository feeUnitRepository;
    
    public ApartmentFeeUnit getFeeUnit() {
        Optional<ApartmentFeeUnit> feeUnitOpt = feeUnitRepository.findById(1L);
        
        if (feeUnitOpt.isPresent()) {
            return feeUnitOpt.get();
        }
        
        // Tạo đơn giá mặc định nếu chưa có
        ApartmentFeeUnit defaultUnit = new ApartmentFeeUnit();
        defaultUnit.setId(1L);
        defaultUnit.setApartmentPricePerM2(300000L);
        defaultUnit.setServiceFeePerM2(15000L);
        defaultUnit.setMotorbikeParkingFeeByMonth(100000L);
        defaultUnit.setMotorbikeParkingFeeByHour(5000L);
        defaultUnit.setCarParkingFeeByMonth(1500000L);
        defaultUnit.setCarParkingFeeByHour(15000L);
        defaultUnit.setWaterFeePerM3(15000L);
        defaultUnit.setElectricityFeePerKWh(3500L);
        feeUnitRepository.save(defaultUnit);
        
        return defaultUnit;
    }
    
    public ApartmentFeeUnit saveFeeUnit(ApartmentFeeUnit feeUnit) {
        return feeUnitRepository.save(feeUnit);
    }

    public Optional<ApartmentFeeUnit> findById(long l) {
        return feeUnitRepository.findById(l);
    }
}