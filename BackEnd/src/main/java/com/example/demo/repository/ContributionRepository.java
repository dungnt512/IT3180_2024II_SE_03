package com.example.demo.repository;

import com.example.demo.entity.Contribution;
import com.example.demo.enums.ContributionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, Long> {
    List<Contribution> findByStatus(ContributionStatus status);
    List<Contribution> findByStatusIn(Collection<ContributionStatus> statuses);
    List<Contribution> findByContributionTypeId(Long contributionTypeId);
    List<Contribution> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date, LocalDate date2);
    List<Contribution> findByIsNotified(Boolean isNotified);
} 