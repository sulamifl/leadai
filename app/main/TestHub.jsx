"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const HubContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #14465a 0%, #0d2f3d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: Arial, sans-serif;
`;

const HubHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const HubTitle = styled.h1`
  color: #ffffff;
  font-size: 2.8em;
  font-weight: bold;
  margin-bottom: 12px;
`;

const HubSubtitle = styled.p`
  color: #cfe0e8;
  font-size: 1.15em;
  max-width: 640px;
  line-height: 1.6;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 900px;
  width: 100%;
`;

const Card = styled.button`
  background-color: #ffffff;
  border: none;
  border-radius: 16px;
  padding: 40px 30px;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  }

  &:focus {
    outline: 3px solid #800120;
    outline-offset: 2px;
  }
`;

const CardBadge = styled.span`
  background-color: ${(props) => (props.accent ? "#800120" : "#14465a")};
  color: #ffffff;
  font-size: 0.75em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 6px 12px;
  border-radius: 20px;
  margin-bottom: 18px;
`;

const CardTitle = styled.h2`
  color: #14465a;
  font-size: 1.8em;
  font-weight: bold;
  margin-bottom: 12px;
`;

const CardDescription = styled.p`
  color: #555;
  font-size: 1em;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const CardAction = styled.span`
  color: ${(props) => (props.accent ? "#800120" : "#14465a")};
  font-weight: bold;
  font-size: 1em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const BackButton = styled.button`
  background: transparent;
  color: #cfe0e8;
  border: 1px solid #cfe0e8;
  padding: 10px 22px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: bold;
  margin-top: 40px;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #cfe0e8;
    color: #14465a;
  }
`;

const TestHub = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const goToTrainer = () => {
    router.push("/main?mode=trainer");
  };

  const goToExam = () => {
    router.push("/main?mode=trainer");
  };

  const goToPractice = () => {
    router.push("/main?mode=practice");
  };

  const goBack = () => {
    router.push("/cabinet");
  };

  return (
    <HubContainer>
      <HubHeader>
        <HubTitle>{t("test_hub_title")}</HubTitle>
        <HubSubtitle>
          {t("test_hub_subtitle")}
        </HubSubtitle>
      </HubHeader>

      <CardsGrid>
        <Card onClick={goToExam}>
          <CardBadge accent>{t("test_hub_exam_badge")}</CardBadge>
          <CardTitle>{t("test_hub_exam_title")}</CardTitle>
          <CardDescription>
            {t("test_hub_exam_desc")}
          </CardDescription>
          <CardAction accent>{t("test_hub_exam_action")}</CardAction>
        </Card>

        <Card onClick={goToTrainer}>
          <CardBadge>{t("test_hub_trainer_badge")}</CardBadge>
          <CardTitle>{t("test_hub_trainer_title")}</CardTitle>
          <CardDescription>
            {t("test_hub_trainer_desc")}
          </CardDescription>
          <CardAction>{t("test_hub_trainer_action")}</CardAction>
        </Card>

        <Card onClick={goToPractice}>
          <CardBadge>{t("test_hub_practice_badge")}</CardBadge>
          <CardTitle>{t("test_hub_practice_title")}</CardTitle>
          <CardDescription>
            {t("test_hub_practice_desc")}
          </CardDescription>
          <CardAction>{t("test_hub_practice_action")}</CardAction>
        </Card>
      </CardsGrid>

      <BackButton onClick={goBack}>{t("test_hub_back")}</BackButton>
    </HubContainer>
  );
};

export default TestHub;
