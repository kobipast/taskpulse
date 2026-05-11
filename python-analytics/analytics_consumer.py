import json
from collections import Counter
from kafka import KafkaConsumer

TOPIC = "task-events"
BOOTSTRAP_SERVERS = "localhost:9092"
GROUP_ID = "taskpulse-python-analytics"


def main() -> None:
    consumer = KafkaConsumer(
        TOPIC,
        bootstrap_servers=BOOTSTRAP_SERVERS,
        group_id=GROUP_ID,
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda value: value.decode("utf-8"),
    )

    status_counter = Counter()
    event_counter = Counter()

    print("Python analytics consumer started...")

    for message in consumer:
        try:
            envelope = json.loads(message.value)

            event_type = envelope.get("type", "UNKNOWN")
            payload = envelope.get("payload", {})

            event_counter[event_type] += 1

            status = payload.get("status")
            if status:
                status_counter[status] += 1

            print("\n--- Event received ---")
            print(f"type: {event_type}")
            print(f"taskId: {payload.get('taskId')}")
            print(f"title: {payload.get('title')}")
            print(f"status: {payload.get('status')}")

            print("\n--- Analytics ---")
            print(f"events by type: {dict(event_counter)}")
            print(f"statuses seen: {dict(status_counter)}")

        except Exception as error:
            print(f"Failed to process message: {error}")
            print(f"raw message: {message.value}")


if __name__ == "__main__":
    main()