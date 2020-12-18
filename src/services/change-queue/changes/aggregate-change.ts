import {Change} from '@/services/change-queue/change-queue';

export class AggregateChange implements Change{
    protected changes: Change[];
    constructor(changes: Change[]){
        this.changes = changes;
    }


    execute(): void {
        this.changes.forEach(change => {
            console.log(change)
            change.execute();
        })
    }

    revert(): void {
        this.changes.forEach(change => {
            change.revert();
        })
    }

    toString(): string {
        return 'updates';
    }
}