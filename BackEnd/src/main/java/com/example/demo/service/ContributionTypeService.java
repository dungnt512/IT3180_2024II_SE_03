package com.example.demo.service;

import com.example.demo.dto.ContributionTypeDTO;
import com.example.demo.entity.ContributionType;
import com.example.demo.entity.User;
import com.example.demo.repository.ContributionTypeRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContributionTypeService {

    @Autowired
    private ContributionTypeRepository contributionTypeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ContributionTypeDTO> getAllContributionTypes() {
        List<ContributionType> types = contributionTypeRepository.findAll();
        return types.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ContributionTypeDTO> getActiveContributionTypes() {
        List<ContributionType> types = contributionTypeRepository.findByIsActive(true);
        return types.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ContributionTypeDTO getContributionTypeById(Long id) {
        ContributionType type = contributionTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại đóng góp"));
        return convertToDTO(type);
    }

    @Transactional
    public ContributionTypeDTO createContributionType(ContributionTypeDTO dto, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));

        ContributionType type = new ContributionType();
        type.setName(dto.getName());
        type.setDescription(dto.getDescription());
        type.setCreatedBy(currentUserId);
        type.setIsActive(true);

        ContributionType savedType = contributionTypeRepository.save(type);
        return convertToDTO(savedType);
    }

    @Transactional
    public ContributionTypeDTO updateContributionType(Long id, ContributionTypeDTO dto) {
        ContributionType type = contributionTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại đóng góp"));

        type.setName(dto.getName());
        type.setDescription(dto.getDescription());
        type.setIsActive(dto.getIsActive());

        ContributionType savedType = contributionTypeRepository.save(type);
        return convertToDTO(savedType);
    }

    @Transactional
    public void deleteContributionType(Long id) {
        ContributionType type = contributionTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại đóng góp"));

        type.setIsActive(false);
        contributionTypeRepository.save(type);
    }

    private ContributionTypeDTO convertToDTO(ContributionType type) {
        ContributionTypeDTO dto = new ContributionTypeDTO();
        dto.setId(type.getId());
        dto.setName(type.getName());
        dto.setDescription(type.getDescription());
        dto.setCreatedAt(type.getCreatedAt());
        dto.setCreatedBy(type.getCreatedBy());
        dto.setIsActive(type.getIsActive());

        if (type.getCreatedBy() != null) {
            userRepository.findById(type.getCreatedBy())
                    .ifPresent(user -> dto.setCreatedByName(user.getName()));
        }

        return dto;
    }
} 