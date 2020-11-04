import {Network, Node, Organization} from '@stellarbeat/js-stellar-domain';
import Vue from 'vue';

export default class LocalNetworks {

    static getFBASNetwork() {
        let organizations = [{
            id: 'sp',
            name: 'Satoshipay',
            validators: ['sp1', 'sp2']
        }, {
            id: 'lb',
            name: 'LOBSTR',
            validators: ['lb1', 'lb2']
        }, {
            id: 'sdf',
            name: 'SDF',
            validators: ['sdf1', 'sdf2']
        }].map(organization => Organization.fromJSON(organization)!);
        let nodes = [
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sdf1',
                'name': 'SDF1',
                'active': true,
                'overLoaded': false,
                'organizationId': 'sdf',
                'quorumSet': {
                    'threshold': 2,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 1,
                            'validators': [
                                'lb1',
                                'lb2'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 1,
                            'validators': [
                                'sp1',
                                'sp2'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sdf2',
                'name': 'SDF2',
                'active': true,
                'overLoaded': false,
                'organizationId': 'sdf',
                'quorumSet': {
                    'threshold': 2,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 1,
                            'validators': [
                                'lb1',
                                'lb2'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 1,
                            'validators': [
                                'sp1',
                                'sp2'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'lb1',
                'name': 'LOBSTR1',
                'active': true,
                'overLoaded': false,
                'organizationId': 'lb',
                'quorumSet': {
                    'threshold': 2,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 1,
                            'validators': [
                                'sdf1',
                                'sdf2'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 1,
                            'validators': [
                                'sp1',
                                'sp2'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'lb2',
                'name': 'LOBSTR2',
                'active': true,
                'overLoaded': false,
                'organizationId': 'lb',
                'quorumSet': {
                    'threshold': 2,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 1,
                            'validators': [
                                'sdf1',
                                'sdf2'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 1,
                            'validators': [
                                'sp1',
                                'sp2'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sp1',
                'name': 'SatoshiPay1',
                'organizationId': 'sp',
                'active': true,
                'overLoaded': false,
                'quorumSet': {
                    'threshold': 2,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 1,
                            'validators': [
                                'sdf1',
                                'sdf2'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 1,
                            'validators': [
                                'lb1',
                                'lb2'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sp2',
                'name': 'SatoshiPay2',
                'active': true,
                'overLoaded': false,
                'organizationId': 'sp',
                'quorumSet': {
                    'threshold': 2,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 1,
                            'validators': [
                                'sdf1',
                                'sdf2'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 1,
                            'validators': [
                                'lb1',
                                'lb2'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            }
        ].map(node => Node.fromJSON(node));
        return new Network(nodes, organizations);
    }

    static getFBAS2Network() {
        let organizations = [{
            id: 'sp',
            name: 'Satoshipay',
            validators: ['sp1', 'sp2', 'sp3']
        }, {
            id: 'lb',
            name: 'LOBSTR',
            validators: ['lb1', 'lb2', 'lb3']
        }, {
            id: 'sdf',
            name: 'SDF',
            validators: ['sdf1', 'sdf2', 'sdf3']
        }].map(organization => Organization.fromJSON(organization)!);
        let nodes = [
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sdf1',
                'name': 'SDF1',
                'active': true,
                'overLoaded': false,
                'organizationId': 'sdf',
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sdf2',
                'name': 'SDF2',
                'active': true,
                'overLoaded': false,
                'organizationId': 'sdf',
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sdf3',
                'name': 'SDF3',
                'active': true,
                'overLoaded': false,
                'organizationId': 'sdf',
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'lb1',
                'name': 'LOBSTR1',
                'active': true,
                'overLoaded': false,
                'organizationId': 'lb',
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'lb2',
                'name': 'LOBSTR2',
                'active': true,
                'overLoaded': false,
                'organizationId': 'lb',
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'lb3',
                'name': 'LOBSTR3',
                'active': true,
                'overLoaded': false,
                'organizationId': 'lb',
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sp1',
                'name': 'SatoshiPay1',
                'organizationId': 'sp',
                'active': true,
                'overLoaded': false,
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sp2',
                'name': 'SatoshiPay2',
                'active': true,
                'overLoaded': false,
                'organizationId': 'sp',
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
            {
                'ip': 'localhost',
                'port': 11625,
                'publicKey': 'sp3',
                'name': 'SatoshiPay3',
                'organizationId': 'sp',
                'active': true,
                'overLoaded': false,
                'quorumSet': {
                    'threshold': 3,
                    'validators': [],
                    'innerQuorumSets': [
                        {
                            'threshold': 2,
                            'validators': [
                                'lb1',
                                'lb2',
                                'lb3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sp1',
                                'sp2',
                                'sp3'
                            ],
                            'innerQuorumSets': []
                        },
                        {
                            'threshold': 2,
                            'validators': [
                                'sdf1',
                                'sdf2',
                                'sdf3'
                            ],
                            'innerQuorumSets': []
                        }
                    ]
                },
                'isValidator': true,
                'isValidating': true
            },
        ].map(node => Node.fromJSON(node));
        return new Network(nodes, organizations);
    }

}