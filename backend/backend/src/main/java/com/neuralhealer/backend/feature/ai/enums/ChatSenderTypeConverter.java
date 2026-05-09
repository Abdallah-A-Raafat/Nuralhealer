package com.neuralhealer.backend.feature.ai.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ChatSenderTypeConverter implements AttributeConverter<ChatSenderType, String> {

    @Override
    public String convertToDatabaseColumn(ChatSenderType attribute) {
        if (attribute == null) return null;
        return attribute.name(); // returns "patient" or "ai"
    }

    @Override
    public ChatSenderType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return ChatSenderType.valueOf(dbData);
    }
}