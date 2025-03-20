import { Box, Input } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import { EditIcon } from "@twilio-paste/icons/esm/EditIcon";

import ParticipantsView from "./ParticipantsView";
import Settings from "../settings/Settings";
import React, { useState, useEffect, useRef } from "react";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";

interface ConversationDetailsProps {
  convoSid: string;
  participants: ReduxParticipant[];
  convo: ReduxConversation;
  updateConvoName: (title: string) => void;
}

const peopleLogo = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet"><g transform="matrix(0.12262, 0, 0, -0.12262, -156.467102, -4863.772949)" fill="" stroke="none" style="transform-origin: 112.488px 4839.39px;"><path d="M2345 4629 c-982 -103 -1755 -882 -1855 -1868 -68 -682 219 -1373 753 -1810 421 -344 977 -513 1508 -461 729 73 1357 506 1675 1155 369 755 253 1641 -299 2280 -438 507 -1114 774 -1782 704z m361 -169 c678 -55 1263 -452 1565 -1063 300 -608 250 -1337 -130 -1898 -39 -57 -81 -116 -94 -132 l-23 -27 -150 56 c-82 31 -295 105 -474 165 l-325 108 -3 80 c-3 86 -1 94 83 310 20 52 45 130 55 175 11 51 31 103 53 140 43 69 80 178 102 295 19 106 19 164 -1 232 -19 63 -15 206 11 383 14 88 15 123 6 191 -37 278 -221 507 -476 593 -119 40 -175 47 -355 46 -146 -1 -188 -5 -255 -23 -103 -28 -204 -76 -282 -135 -195 -148 -308 -437 -264 -672 5 -27 14 -110 20 -185 10 -117 9 -142 -5 -190 -41 -137 18 -429 114 -567 10 -15 28 -68 40 -118 11 -50 37 -133 57 -185 44 -111 57 -186 53 -294 l-3 -80 -285 -95 c-157 -53 -352 -122 -435 -154 -82 -32 -163 -63 -179 -68 -34 -13 -40 -6 -147 151 -380 561 -430 1290 -130 1898 308 623 900 1017 1601 1066 97 7 132 7 256 -3z"/></g></svg>`;

const ConversationDetails: React.FC<ConversationDetailsProps> = (
  props: ConversationDetailsProps
) => {
  const theme = useTheme();
  const [isManageParticipantOpen, setIsManageParticipantOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(
    props.convo.friendlyName ?? props.convo.sid
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleEditClick = () => {
    setEditedText(props.convo.friendlyName ?? props.convo.sid);
    setIsEditing(true);
  };

  const handleInputChange = (convoName: string) => {
    setEditedText(convoName);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        if (editedText !== props.convo.friendlyName) {
          props.updateConvoName(editedText);
        }
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setIsEditing(false);
        if (editedText !== props.convo.friendlyName) {
          props.updateConvoName(editedText);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [editedText]);

  return (
    <Box
      style={{
        minHeight: 65,
        maxHeight: 65,
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomStyle: "solid",
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColors.colorBorderWeak,
      }}
    >
      <Box
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            lineHeight: "1.4",
          }}
          color="colorText"
          fontFamily="fontFamilyText"
          fontSize="fontSize50"
          fontWeight="fontWeightBold"
          maxHeight="100%"
        >
          {isEditing ? (
            <Input
              type="text"
              value={editedText}
              onChange={(e) => handleInputChange(e.target.value)}
              ref={inputRef}
            />
          ) : (
            <>{props.convo.friendlyName ?? props.convo.sid}</>
          )}
          <button
            style={{
              width: "1rem",
              height: "1rem",
              border: "none",
              background: "transparent",
              padding: "0",
              margin: "0 2em",
              flex: "0 0 auto",
              cursor: "pointer",
            }}
            className="hoff-person"
            title="Open People record"
            onClick={(e) => window.hoff.navPerson(e)}
            data-uid={props.convo.uniqueName ?? ""}
            dangerouslySetInnerHTML={{ __html: peopleLogo }}
          ></button>
        </Box>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ParticipantsView
            participants={props.participants}
            onParticipantListOpen={() => setIsManageParticipantOpen(true)}
          />

          <Settings
            convo={props.convo}
            participants={props.participants}
            isManageParticipantOpen={isManageParticipantOpen}
            setIsManageParticipantOpen={setIsManageParticipantOpen}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationDetails;
