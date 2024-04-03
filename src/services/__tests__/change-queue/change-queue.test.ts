import { NetworkChangeQueue } from "../../change-queue/network-change-queue";
import { EntityPropertyUpdate } from "../../change-queue/changes/entity-property-update";
import { Network } from "@stellarbeat/js-stellarbeat-shared";
import NetworkAnalyzer from "@/services/NetworkAnalyzer";
import { mock } from "jest-mock-extended";

describe("update manager", () => {
  let myNodeUpdateManager: NetworkChangeQueue;
  const update1 = mock<EntityPropertyUpdate>();
  const update2 = mock<EntityPropertyUpdate>();
  const update3 = mock<EntityPropertyUpdate>();

  beforeEach(() => {
    const networkAnalyzerMock = mock<NetworkAnalyzer>();
    myNodeUpdateManager = new NetworkChangeQueue(
      new Network([]),
      networkAnalyzerMock as NetworkAnalyzer,
    );
    jest.resetAllMocks();
  });

  test("add", () => {
    myNodeUpdateManager.execute(update1);
    myNodeUpdateManager.execute(update2);
    myNodeUpdateManager.execute(update3);
    expect(update1.execute).toHaveBeenCalled();
    expect(update2.execute).toHaveBeenCalled();
    expect(update3.execute).toHaveBeenCalled();
  });

  test("redo should do nothing", () => {
    myNodeUpdateManager.redo();
    myNodeUpdateManager.execute(update1);
    myNodeUpdateManager.redo();
    expect(update1.execute).toHaveBeenCalledTimes(1);
  });

  test("undo", () => {
    myNodeUpdateManager.execute(update1);
    myNodeUpdateManager.undo();
    expect(update1.execute).toHaveBeenCalledTimes(1);
    expect(update1.revert).toHaveBeenCalledTimes(1);
  });

  test("undo once, redo once", () => {
    myNodeUpdateManager.execute(update1);
    myNodeUpdateManager.undo();
    myNodeUpdateManager.redo();
    expect(update1.execute).toHaveBeenCalledTimes(2);
    expect(update1.revert).toHaveBeenCalledTimes(1);
  });

  test("undo twice, redo once", () => {
    myNodeUpdateManager.execute(update1);
    myNodeUpdateManager.execute(update2);
    myNodeUpdateManager.undo();
    myNodeUpdateManager.undo();
    myNodeUpdateManager.redo();
    expect(update1.execute).toHaveBeenCalledTimes(2);
    expect(update2.execute).toHaveBeenCalledTimes(1);
    expect(update1.revert).toHaveBeenCalledTimes(1);
    expect(update2.revert).toHaveBeenCalledTimes(1);
  });

  test("splice queue", () => {
    myNodeUpdateManager.execute(update1);
    myNodeUpdateManager.execute(update2);
    myNodeUpdateManager.undo();
    myNodeUpdateManager.execute(update3);
    myNodeUpdateManager.redo(); //should trigger nothing
    myNodeUpdateManager.undo();
    myNodeUpdateManager.undo();
    myNodeUpdateManager.undo();
    myNodeUpdateManager.undo();

    expect(update1.execute).toHaveBeenCalledTimes(1);
    expect(update2.execute).toHaveBeenCalledTimes(1);
    expect(update3.execute).toHaveBeenCalledTimes(1);
    expect(update1.revert).toHaveBeenCalledTimes(1);
    expect(update2.revert).toHaveBeenCalledTimes(1);
    expect(update3.revert).toHaveBeenCalledTimes(1);
  });

  /*test('undoQueueToString', () => {
        myNodeUpdateManager.execute(update1);
        myNodeUpdateManager.execute(update2);
        expect(myNodeUpdateManager.undoQueueToString()).toEqual(['b', 'a']);
    });

    test('redoQueueToString', () => {
        myNodeUpdateManager.execute(update1);
        myNodeUpdateManager.execute(update2);
        myNodeUpdateManager.execute(update3);
        myNodeUpdateManager.undo();
        myNodeUpdateManager.undo();
        myNodeUpdateManager.undo();
        expect(myNodeUpdateManager.redoQueueToString()).toEqual(['a', 'b', 'c']);
    });*/

  test("reset", () => {
    myNodeUpdateManager.execute(update1);
    myNodeUpdateManager.execute(update2);
    myNodeUpdateManager.execute(update3);
    myNodeUpdateManager.reset();

    expect(update1.revert).toHaveBeenCalledTimes(1);
    expect(update2.revert).toHaveBeenCalledTimes(1);
    expect(update3.revert).toHaveBeenCalledTimes(1);
  });
});
