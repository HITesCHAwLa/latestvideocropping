import React from "react";
import { endOfToday, set } from "date-fns";
import TimeRange from "@marenaud/react-timeline-range-slider";

const now = new Date();
now.setDate(now.getDate() - 5);
const getTodayAtSpecificHour = (hour = 24) =>
  set(now, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });

const getTrueTodayAtSpecificHour = (hour = 12) =>
  set(new Date(), { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });

const selectedStart = getTrueTodayAtSpecificHour();
const selectedEnd = getTrueTodayAtSpecificHour(14);

const startTime = getTodayAtSpecificHour(0);
const endTime = getTrueTodayAtSpecificHour(17);

class Rangeslider extends React.Component {
  state = {
    error: false,
    selectedInterval: [selectedStart, selectedEnd],
  };

  errorHandler = ({ error }) => this.setState({ error });

  onChangeCallback = (selectedInterval) => {
    console.log(selectedInterval);
    this.setState({ selectedInterval });
  };

  render() {
    const { selectedInterval, error } = this.state;
    return (
      <TimeRange
        error={error}
        ticksNumber={10}
        selectedInterval={selectedInterval}
        timelineInterval={[startTime, endTime]}
        onUpdateCallback={this.errorHandler}
        onChangeCallback={this.onChangeCallback}
        // disabledIntervals={disabledIntervals}
      />
    );
  }
}

export default Rangeslider;
