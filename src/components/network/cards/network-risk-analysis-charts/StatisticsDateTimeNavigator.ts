import moment from 'moment';
import Store from '@/store/Store';

export default class StatisticsDateTimeNavigator {

    protected statisticsTrackingStartDate:Date;

    constructor(statisticsTrackingStartDate: Date) {
        this.statisticsTrackingStartDate = statisticsTrackingStartDate;
    }

    protected subtractBucket(bucketSize:string, fromDate:Date){
        if (bucketSize === '30D')
            return moment(fromDate).subtract(30, 'd').toDate();
        else if (bucketSize === '12H')
            return moment(fromDate).subtract(12, 'h').toDate();
        else if (bucketSize === '24H')
            return moment(fromDate).subtract(1, 'd').toDate();
        else if (bucketSize === '1H')
            return moment(fromDate).subtract(1, 'h').toDate();
        else if (bucketSize === '1Y')
            return moment(fromDate).subtract(1, 'y').toDate();
        else
            throw new Error('unknown bucket size');
    }

    goBack(bucketSize:string, fromDate:Date){
        let selectedDate:Date = this.subtractBucket(bucketSize, fromDate);

        //does the window have data?
        if (selectedDate < this.getMinSelectedDate(bucketSize)) {
            selectedDate.setTime(this.getMinSelectedDate(bucketSize).getTime());
        }

        return selectedDate;
    }

    canGoBack(bucketSize:string, fromDate:Date){
        let selectedDate:Date = this.subtractBucket(bucketSize, fromDate);
        return selectedDate > this.statisticsTrackingStartDate;
    }

    goForward(bucketSize:string, fromDate:Date) {
        let selectedDate:Date;
        if (bucketSize === '30D')
            selectedDate = moment(fromDate).add(30, 'd').toDate();
        else if (bucketSize === '12H')
            selectedDate = moment(fromDate).add(12, 'h').toDate();
        else if (bucketSize === '24H')
            selectedDate = moment(fromDate).add(1, 'd').toDate();
        else if (bucketSize === '1H')
            selectedDate = moment(fromDate).add(1, 'h').toDate();
        else if (bucketSize === '1Y')
            selectedDate = moment(fromDate).add(1, 'y').toDate();
        else
            throw new Error('unknown bucket size');

        return selectedDate;
    }

    //because statistics are shown from time point: selectedDate - bucketSize, we add the bucket size to the first available statistic
    getMinSelectedDate(bucketSize:string) {
        if (bucketSize === '30D')
            return moment(this.statisticsTrackingStartDate).add(30, 'd').toDate();
        else if (bucketSize === '12H')
            return moment(this.statisticsTrackingStartDate).add(12, 'h').toDate();
        else if (bucketSize === '24H')
            return moment(this.statisticsTrackingStartDate).add(24, 'h').toDate();
        else if (bucketSize === '1H')
            return moment(this.statisticsTrackingStartDate).add(1, 'h').toDate();
        else if (bucketSize === '1Y')
            return moment(this.statisticsTrackingStartDate).add(1, 'y').toDate();
        else
            throw new Error('unknown bucket size');
    }

    //todo: could be cleaner
    getInitialSelectedDate(bucketSize:string, crawlDate:Date) {
        if (bucketSize === '30D'){
            if (moment(crawlDate).subtract(30, 'd') < moment(this.statisticsTrackingStartDate)) {
                return moment(this.statisticsTrackingStartDate).add(30, 'd').startOf('day').toDate();
            } else
                return moment(crawlDate).startOf('day').toDate();
        }
        else if (bucketSize === '12H'){
            if (moment(crawlDate).subtract(24, 'h') < moment(this.statisticsTrackingStartDate)) {
                return moment(this.statisticsTrackingStartDate).add(12, 'h').toDate();
            } else
                return crawlDate;
        }
        else if (bucketSize === '24H'){
            if (moment(crawlDate).subtract(24, 'h') < moment(this.statisticsTrackingStartDate)) {
                return moment(this.statisticsTrackingStartDate).add(24, 'h').toDate();
            } else
                return crawlDate;
        }
        else if (bucketSize === '1H'){
            if (moment(crawlDate).subtract(1, 'h') < moment(this.statisticsTrackingStartDate)) {
                return moment(this.statisticsTrackingStartDate).add(1, 'h').toDate();
            } else
                return crawlDate;
        }
        else if (bucketSize === '1Y'){
            if (moment(crawlDate).subtract(1, 'y') < moment(this.statisticsTrackingStartDate)) {
                return moment(this.statisticsTrackingStartDate).add(1, 'y').toDate();
            } else
                return crawlDate;
        }
        else
            throw new Error('unknown bucket size');

    }

}
