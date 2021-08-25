import {
    IndexManagementOptionInterface
} from '../../src/app/modules/elasticsearch-index-management/interfaces/index-management-option.interface';
import { MockClosedIndices, MockOpenedIndices } from '../return-data';

export const MockIndexManagementOptionInterfaceDeleteIndices: IndexManagementOptionInterface = {
    action: 'DeleteIndices',
    index_list: MockClosedIndices
};

export const MockIndexManagementOptionInterfaceCloseIndices: IndexManagementOptionInterface = {
    action: 'CloseIndices',
    index_list: MockOpenedIndices
};