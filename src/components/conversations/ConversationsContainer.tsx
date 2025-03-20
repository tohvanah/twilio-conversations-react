import React, { useState } from "react";
import { Client } from "@twilio/conversations";
import { ChevronDoubleLeftIcon } from "@twilio-paste/icons/esm/ChevronDoubleLeftIcon";
import { Box, Input } from "@twilio-paste/core";
import { ChevronDoubleRightIcon } from "@twilio-paste/icons/esm/ChevronDoubleRightIcon";

import CreateConversationButton from "./CreateConversationButton";
import ConversationsList from "./ConversationsList";
import styles from "../../styles";

import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { filterConversations } from "./../../store/action-creators";
import { actionCreators, AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";

interface ConvosContainerProps {
  client?: Client;
}

const ConversationsContainer: React.FC<ConvosContainerProps> = (
  props: ConvosContainerProps
) => {
  const [listHidden, hideList] = useState(false);
  const dispatch = useDispatch();

  const { updateCurrentConversation } = bindActionCreators(
    actionCreators,
    dispatch
  );

  const local = useSelector((state: AppState) => state.local);
  const search = getTranslation(local, "convoSearch");

  const handleSearch = (searchString: string) => {
    dispatch(filterConversations(searchString));
  };

  return (
    <Box
      style={
        window.isAdminMonitor
          ? listHidden
            ? { ...styles.convosWrapperIsAdmin, ...styles.collapsedListIsAdmin }
            : styles.convosWrapperIsAdmin
          : listHidden
          ? { ...styles.convosWrapper, ...styles.collapsedList }
          : styles.convosWrapper
      }
    >
      <Box style={styles.newConvoButton}>
        <Box>
          <Input
            aria-describedby="convo_string_search"
            id="convoString"
            name="convoString"
            type="text"
            placeholder={search}
            onChange={(e) => handleSearch(e.target.value)}
            required
            autoFocus
          />
        </Box>
      </Box>
      <Box style={styles.convoList}>
        {!listHidden || window.isAdminMonitor ? <ConversationsList /> : null}
      </Box>
      <Box style={styles.collapseButtonBox}>
        <Box
          paddingTop="space30"
          style={{
            paddingLeft: 10,
            paddingRight: 10,
          }}
          id="convoListCollapse"
          onClick={() => {
            console.log(
              "CLICK LIST HIDDEN: " + (listHidden ? "true" : "false")
            );
            if (listHidden && window.isAdminMonitor) {
              document.body.classList.remove("convoListCollapsed");
              /* clear current convo */
              updateCurrentConversation("");
            } else {
              document.body.classList.add("convoListCollapsed");
            }
            hideList(!listHidden);
          }}
        >
          {listHidden ? (
            <ChevronDoubleRightIcon decorative={false} title="Collapse" />
          ) : (
            <ChevronDoubleLeftIcon decorative={false} title="Collapse" />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationsContainer;
