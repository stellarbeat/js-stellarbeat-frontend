export default class StatisticsDateTimeNavigator {
  protected statisticsTrackingStartDate: Date;

  constructor(statisticsTrackingStartDate: Date) {
    this.statisticsTrackingStartDate = statisticsTrackingStartDate;
  }

  protected subtractBucket(bucketSize: string, fromDate: Date) {
    const date = new Date(fromDate.getTime()); // Create a new Date object from the fromDate value
    if (bucketSize === "30D") {
      date.setDate(date.getDate() - 30); // Subtract 30 days
    } else if (bucketSize === "12H") {
      date.setTime(date.getTime() - 12 * 60 * 60 * 1000); // Subtract 12 hours
    } else if (bucketSize === "24H") {
      date.setDate(date.getDate() - 1); // Subtract 1 day
    } else if (bucketSize === "1H") {
      date.setTime(date.getTime() - 60 * 60 * 1000); // Subtract 1 hour
    } else if (bucketSize === "1Y") {
      date.setFullYear(date.getFullYear() - 1); // Subtract 1 year
    } else {
      throw new Error("unknown bucket size");
    }
    return date;
  }

  goBack(bucketSize: string, fromDate: Date) {
    const selectedDate: Date = this.subtractBucket(bucketSize, fromDate);

    //does the window have data?
    if (selectedDate < this.getMinSelectedDate(bucketSize)) {
      selectedDate.setTime(this.getMinSelectedDate(bucketSize).getTime());
    }

    return selectedDate;
  }

  canGoBack(bucketSize: string, fromDate: Date) {
    const selectedDate: Date = this.subtractBucket(bucketSize, fromDate);
    return selectedDate > this.statisticsTrackingStartDate;
  }

  goForward(bucketSize: string, fromDate: Date) {
    const selectedDate = new Date(fromDate.getTime()); // Create a new Date object from the fromDate value
    if (bucketSize === "30D") {
      selectedDate.setDate(selectedDate.getDate() + 30); // Add 30 days
    } else if (bucketSize === "12H") {
      selectedDate.setTime(selectedDate.getTime() + 12 * 60 * 60 * 1000); // Add 12 hours
    } else if (bucketSize === "24H") {
      selectedDate.setDate(selectedDate.getDate() + 1); // Add 1 day
    } else if (bucketSize === "1H") {
      selectedDate.setTime(selectedDate.getTime() + 60 * 60 * 1000); // Add 1 hour
    } else if (bucketSize === "1Y") {
      selectedDate.setFullYear(selectedDate.getFullYear() + 1); // Add 1 year
    } else {
      throw new Error("unknown bucket size");
    }
    return selectedDate;
  }

  //because statistics are shown from time point: selectedDate - bucketSize, we add the bucket size to the first available statistic
  getMinSelectedDate(bucketSize: string) {
    const selectedDate = new Date(this.statisticsTrackingStartDate.getTime()); // Create a new Date object from the statisticsTrackingStartDate value
    if (bucketSize === "30D") {
      selectedDate.setDate(selectedDate.getDate() + 30); // Add 30 days
    } else if (bucketSize === "12H") {
      selectedDate.setTime(selectedDate.getTime() + 12 * 60 * 60 * 1000); // Add 12 hours
    } else if (bucketSize === "24H") {
      selectedDate.setDate(selectedDate.getDate() + 24); // Add 24 hours
    } else if (bucketSize === "1H") {
      selectedDate.setTime(selectedDate.getTime() + 60 * 60 * 1000); // Add 1 hour
    } else if (bucketSize === "1Y") {
      selectedDate.setFullYear(selectedDate.getFullYear() + 1); // Add 1 year
    } else {
      throw new Error("unknown bucket size");
    }
    return selectedDate;
  }

  getInitialSelectedDate(bucketSize: string, time: Date) {
    if (bucketSize === "30D") {
      return this.getInitialSelectedDateFor30D(time);
    } else if (bucketSize === "12H") {
      return this.getInitialSelectedDateFor12H(time);
    } else if (bucketSize === "24H") {
      return this.getInitialSelectedDateFor24H(time);
    } else if (bucketSize === "1H") {
      return this.getInitialSelectedDateFor1H(time);
    } else if (bucketSize === "1Y") {
      return this.getInitialSelectedDateFor1Y(time);
    } else {
      throw new Error("unknown bucket size");
    }
  }

  getInitialSelectedDateFor30D(time: Date) {
    const selectedDate = new Date(time.getTime());
    if (
      selectedDate.getTime() - 30 * 24 * 60 * 60 * 1000 <
      this.statisticsTrackingStartDate.getTime()
    ) {
      const startDate = new Date(this.statisticsTrackingStartDate.getTime());
      startDate.setDate(startDate.getDate() + 30);
      return new Date(startDate.setHours(0, 0, 0, 0));
    } else {
      return new Date(selectedDate.setHours(0, 0, 0, 0));
    }
  }

  getInitialSelectedDateFor12H(time: Date) {
    const selectedDate = new Date(time.getTime());
    if (
      selectedDate.getTime() - 24 * 60 * 60 * 1000 <
      this.statisticsTrackingStartDate.getTime()
    ) {
      const startDate = new Date(this.statisticsTrackingStartDate.getTime());
      startDate.setTime(startDate.getTime() + 12 * 60 * 60 * 1000);
      return startDate;
    } else {
      return time;
    }
  }

  getInitialSelectedDateFor24H(time: Date) {
    const selectedDate = new Date(time.getTime());
    if (
      selectedDate.getTime() - 24 * 60 * 60 * 1000 <
      this.statisticsTrackingStartDate.getTime()
    ) {
      const startDate = new Date(this.statisticsTrackingStartDate.getTime());
      startDate.setDate(startDate.getDate() + 1);
      return startDate;
    } else {
      return time;
    }
  }

  getInitialSelectedDateFor1H(time: Date) {
    const selectedDate = new Date(time.getTime());
    if (
      selectedDate.getTime() - 60 * 60 * 1000 <
      this.statisticsTrackingStartDate.getTime()
    ) {
      const startDate = new Date(this.statisticsTrackingStartDate.getTime());
      startDate.setTime(startDate.getTime() + 60 * 60 * 1000);
      return startDate;
    } else {
      return time;
    }
  }

  getInitialSelectedDateFor1Y(time: Date) {
    const selectedDate = new Date(time.getTime());
    if (
      selectedDate.getTime() - 365 * 24 * 60 * 60 * 1000 <
      this.statisticsTrackingStartDate.getTime()
    ) {
      const startDate = new Date(this.statisticsTrackingStartDate.getTime());
      startDate.setFullYear(startDate.getFullYear() + 1);
      return startDate;
    } else {
      return time;
    }
  }
}
