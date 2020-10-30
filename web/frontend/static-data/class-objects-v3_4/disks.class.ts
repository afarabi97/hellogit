import { DisksClass } from '../../src/app/classes';

export const MockDisksSDAClass: DisksClass = {
    has_root: true,
    name: 'sda',
    size_gb: 50.0,
    size_tb: 0.048828125
};

export const MockDisksSDBClass: DisksClass = {
    has_root: false,
    name: 'sdb',
    size_gb: 50.0,
    size_tb: 0.048828125
};
