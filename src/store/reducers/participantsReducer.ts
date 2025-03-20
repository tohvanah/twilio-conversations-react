import { JSONValue, Participant, ParticipantType } from "@twilio/conversations";
import { participantsMap } from "../../conversations-objects";

import { ActionType } from "../action-types";
import { Action } from "../actions";

export type ReduxParticipant = {
  sid: string;
  attributes: JSONValue;
  identity: string | null;
  type: ParticipantType;
  lastReadMessageIndex: number | null;
};

export type ParticipantsType = Record<string, ReduxParticipant[]>;

const initialState: ParticipantsType = {};

const reduxifyParticipant = (participant: Participant): ReduxParticipant => ({
  sid: participant.sid,
  attributes: participant.attributes,
  identity: participant.identity,
  type: participant.type,
  lastReadMessageIndex: participant.lastReadMessageIndex,
});

const reducer = (
  state: ParticipantsType = initialState,
  action: Action
): ParticipantsType => {
  switch (action.type) {
    case ActionType.UPDATE_PARTICIPANTS:
      const { participants, sid } = action.payload;

      for (const participant of participants) {
        participantsMap.set(participant.sid, participant);
      }

      for (const participant of participants) {
        if (participant.type == "sms" && null == participant.identity) {
          const friendlyName: string | null =
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            participant.attributes["friendlyName"];
          if (null == friendlyName) {
            const sms: string | null =
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              participant.bindings.sms?.address;
            if (sms != null) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              participant.attributes["friendlyName"] = sms;
            }
          }
        }
      }

      return Object.assign({}, state, {
        [sid]: participants
          .filter((participant) => participant.identity != "EnrollmentAdmin")
          .map(reduxifyParticipant),
      });
    default:
      return state;
  }
};

export default reducer;
