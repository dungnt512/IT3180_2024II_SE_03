package com.example.demo.service;

import com.example.demo.dto.ApartmentDTO;
import com.example.demo.dto.BillDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Bill;
import com.example.demo.enums.BillStatus;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class BillService {
    @Autowired
    private BillRepository billRepository;
    @Autowired
    private ApartmentRepository apartmentRepository;

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }
    public Bill getBillById(Long id) {
        return billRepository.findById(id).orElse(null);
    }

    public void saveBill(BillDTO billDTO) {
        Bill bill = new Bill();
        bill.setApartmentNumber(billDTO.getApartmentNumber());
        bill.setAmount(billDTO.getAmount());
        bill.setBillType(billDTO.getBillType());
        bill.setDueDate(billDTO.getDueDate());
        bill.setDescription(billDTO.getDescription());
        bill.setStatus(BillStatus.UNPAID);
        billRepository.save(bill);

        Apartment apartment = apartmentRepository.findByApartmentNumber(billDTO.getApartmentNumber());
        Set<Long> billIds = apartment.getBillIds();
        if (billIds == null) {
            billIds = new HashSet<>();
        }
        billIds.add(bill.getId());
        apartment.setBillIds(billIds);
        apartmentRepository.save(apartment);
    }

    public void updateBill(Bill bill) {
        billRepository.updateBill(bill.getId(), bill.getApartmentNumber(), bill.getBillType(), bill.getAmount(), bill.getDueDate(), bill.getDescription(), bill.getStatus());
    }

    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id).orElse(null);
        Apartment apartment = apartmentRepository.findByApartmentNumber(bill.getApartmentNumber());

        Set<Long> billIds = apartment.getBillIds();
        billIds.remove(bill.getId());
        apartment.setBillIds(billIds);

        billRepository.deleteById(id);
    }

    public Set<Bill> findByIdIn(Set<Long> billIds) {
        return billRepository.findByIdIn(billIds);
    }
}
