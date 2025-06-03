import React, { useEffect } from "react";
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";
import ConversationView from "./ConversationView";
import {
  SetParticipantsType,
  SetSidType,
  SetUnreadMessagesType,
} from "../../types";
import { actionCreators, AppState } from "../../store";
import { getTypingMessage, unexpectedErrorNotification } from "../../helpers";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { getSdkConversationObject } from "../../conversations-objects";
import { ReduxMessage } from "../../store/reducers/messageListReducer";
import { APP_TITLE } from "../../branding";
import { getTranslation } from "./../../utils/localUtils";

import { filterConversations } from "./../../store/action-creators";

declare global {
  interface Window {
    refreshConversations?: () => void;
  }
}

function getLastMessage(
  messages: ReduxMessage[],
  convoLoading: string,
  convoEmpty: string,
  typingData: string[]
) {
  if (messages === undefined || messages === null) {
    return convoLoading;
  }
  if (typingData.length) {
    return getTypingMessage(typingData);
  }
  if (messages.length === 0) {
    return convoEmpty;
  }

  const m = messages[messages.length - 1];

  const a = m.author && m.author[0] == "+" ? "" : m.author + ": ";

  if (!m.body) return a + "Media message";

  return a + m.body;
}

function isMyMessage(messages: ReduxMessage[]) {
  if (messages === undefined || messages === null || messages.length === 0) {
    return false;
  }
  return messages[messages.length - 1].author === window.hoff.identity
    ? messages[messages.length - 1]
    : false;
}

async function updateCurrentConvo(
  setSid: SetSidType,
  convo: ReduxConversation,
  updateParticipants: SetParticipantsType
) {
  console.log(Date() + " updateCurrentConvo()");
  setSid(convo.sid);

  const participants = await getSdkConversationObject(convo).getParticipants();
  updateParticipants(participants, convo.sid);
}

function setUnreadMessagesCount(
  currentconvoSid: string,
  convoSid: string,
  unreadMessages: Record<string, number>,
  updateUnreadMessages: SetUnreadMessagesType,
  messages: ReduxMessage[]
) {
  if (window.isAdminMonitor) {
    if (messages && messages.length) {
      const m = messages[messages.length - 1];
      if (m.author && m.author[0] != "+") return 0;
    }
  }
  if (currentconvoSid == convoSid && unreadMessages[convoSid] !== 0) {
    updateUnreadMessages(convoSid, 0);
    return 0;
  }
  if (currentconvoSid == convoSid) {
    return 0;
  }
  return unreadMessages[convoSid];
}

const ConversationsList: React.FC = () => {
  const sid = useSelector((state: AppState) => state.sid);
  const conversations = useSelector((state: AppState) => state.convos);
  const messages = useSelector((state: AppState) => state.messages);
  const unreadMessages = useSelector((state: AppState) => state.unreadMessages);
  const participants = useSelector((state: AppState) => state.participants);
  const typingData = useSelector((state: AppState) => state.typingData);
  const use24hTimeFormat = useSelector(
    (state: AppState) => state.use24hTimeFormat
  );
  const local = useSelector((state: AppState) => state.local);
  const convoEmpty = getTranslation(local, "convoEmpty");
  const convoLoading = getTranslation(local, "convoLoading");

  const dispatch = useDispatch();
  const {
    updateCurrentConversation,
    updateParticipants,
    updateUnreadMessages,
    setLastReadIndex,
    addNotifications,
  } = bindActionCreators(actionCreators, dispatch);

  if (conversations === undefined || conversations === null) {
    return <div className="empty" />;
  }

  const setDocumentTitle = (sum: number) => {
    document.title = sum >= 1 ? `(${sum}) ${APP_TITLE}` : APP_TITLE;
  };

  useEffect(() => {
    const sum = Object.values(unreadMessages).reduce(
      (acc, value) => acc + value,
      0
    );
    setDocumentTitle(sum);

    return () => new AbortController().abort();
  }, [unreadMessages]);

  useEffect(() => {
    console.log(
      Date() +
        " CONVERSATIONS LIST - conversations dependent " +
        conversations.length +
        " / " +
        window.conversationsTotalLength
    );

    if (
      conversations != undefined &&
      conversations != null &&
      conversations.length > 0 &&
      conversations.length >= window.conversationsTotalLength
    ) {
      let allTransformed = true;
      conversations.forEach((conversation) => {
        const fn = conversation.friendlyName;
        if (typeof fn == "string" && fn.length == 48 && fn.indexOf(" ") == -1) {
          if (window.hoff?.names?.hasOwnProperty(fn)) {
            if (window.hoff.names[fn].length) {
              console.log(
                "converting friendlyName: " + conversation.friendlyName
              );
              conversation.friendlyName = window.hoff.names[fn];
            } else {
              allTransformed = false;
            }
          }
        }
      });

      if (!allTransformed) {
        window.hoff.getNames();
      }
    }
  }, [conversations]);

  const refreshConversationsList = () => {
    console.log(Date() + " REFRESHconversationsList()");
    dispatch(filterConversations(" "));
    setTimeout(() => {
      dispatch(filterConversations(""));
    }, 500);
  };

  useEffect(() => {
    // Make it accessible from outside
    window.refreshConversations = refreshConversationsList;

    // Cleanup on unmount
    return () => {
      delete window.refreshConversations;
    };
  }, []);

  return (
    <div id="conversation-list">
      {conversations.map((convo) => (
        <ConversationView
          use24hTimeFormat={use24hTimeFormat}
          key={convo.sid}
          convoId={convo.sid}
          setSid={updateCurrentConversation}
          currentConvoSid={sid}
          lastMessage={
            getLastMessage(
              messages[convo.sid],
              convoLoading,
              convoEmpty,
              typingData[convo.sid] ?? []
            ) ?? ""
          }
          messages={messages[convo.sid]}
          typingInfo={typingData[convo.sid] ?? []}
          myMessage={isMyMessage(messages[convo.sid])}
          unreadMessagesCount={setUnreadMessagesCount(
            sid,
            convo.sid,
            unreadMessages,
            updateUnreadMessages,
            messages[convo.sid]
          )}
          updateUnreadMessages={updateUnreadMessages}
          participants={participants[convo.sid] ?? []}
          convo={convo}
          onClick={async () => {
            try {
              setLastReadIndex(convo.lastReadMessageIndex ?? -1);
              if (
                window.isAdminMonitor &&
                !document.body.classList.contains("convoListCollapsed")
              ) {
                const cb = document.getElementById("convoListCollapse");
                if (cb) cb.click();
              }
              await updateCurrentConvo(
                updateCurrentConversation,
                convo,
                updateParticipants
              );
              //update unread messages
              updateUnreadMessages(convo.sid, 0);
              //set messages to be read
              const lastMessage =
                messages[convo.sid].length &&
                messages[convo.sid][messages[convo.sid].length - 1];
              if (lastMessage && lastMessage.index !== -1) {
                await getSdkConversationObject(
                  convo
                ).advanceLastReadMessageIndex(lastMessage.index);
              }
            } catch (e) {
              unexpectedErrorNotification(e.message, addNotifications);
            }
          }}
        />
      ))}
    </div>
  );
};

export default ConversationsList;
