import { DisksInterface } from '../../src/app/interfaces';

export const MockDisksSDAInterface: DisksInterface = {
    has_root: true,
    name: 'sda',
    size_gb: 50.0,
    size_tb: 0.048828125,
    disk_rotation: '1'
};

export const MockDisksSDBInterface: DisksInterface = {
    has_root: false,
    name: 'sdb',
    size_gb: 50.0,
    size_tb: 0.048828125,
    disk_rotation: '1'
};
