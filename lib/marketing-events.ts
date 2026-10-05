/**
 * Privacy-safe internal marketing event contract.
 *
 * This module intentionally has no vendor SDK, network transport, persistence,
 * or global data layer. Future vendor adapters subscribe to this narrowly typed
 * stream and must apply their own consent and policy checks before transmitting.
 */

export type MarketingEventMap = {
  ovulation_calculator_view: { placement: "dedicated_page" };
  ovulation_calculation_ready: { source: "ovulation_calculator" };
  ovulation_lead_started: { source: "ovulation_calculator"; hasAttribution: boolean };
  ovulation_lead_submitted: { source: "ovulation_calculator"; marketingConsent: boolean; hasAttribution: boolean };
  ovulation_result_viewed: { source: "ovulation_calculator" };
  weekly_live_spotlight_view: { placement: "homepage"; questionsOpen: boolean };
  weekly_live_opened: { placement: "dedicated_page"; questionsOpen: boolean };
  weekly_live_lead_started: { source: "weekly_live"; hasAttribution: boolean };
  weekly_live_question_submitted: { source: "weekly_live"; marketingConsent: boolean; hasAttribution: boolean };
  weekly_live_join_available: { source: "weekly_live" };
  booking_cta_clicked: { placement: "homepage_finale" };
};

export type MarketingEventName = keyof MarketingEventMap;

export type MarketingEvent = {
  [Name in MarketingEventName]: { name: Name; payload: MarketingEventMap[Name] };
}[MarketingEventName];

type MarketingEventArguments = {
  [Name in MarketingEventName]: [name: Name, payload: MarketingEventMap[Name]];
}[MarketingEventName];

export type MarketingEventSubscriber = (event: MarketingEvent) => void;

const subscribers = new Set<MarketingEventSubscriber>();

export function subscribeMarketingEvents(subscriber: MarketingEventSubscriber): () => void {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function trackMarketingEvent(...[name, payload]: MarketingEventArguments): void {
  const event = { name, payload } as MarketingEvent;

  for (const subscriber of subscribers) {
    try {
      subscriber(event);
    } catch {
      // A future adapter must not interrupt the visitor's feature flow.
    }
  }
}
