import curator
from curator import utils
from elasticsearch.exceptions import ConflictError


class ExtDeleteIndices(curator.DeleteIndices):
    """
    Extended Delete Indicies class from curator
    """
    def __init__(self, ilo, master_timeout=30):
        super().__init__(ilo=ilo, master_timeout=master_timeout)

    def __chunk_loop(self, chunk_list):
        """
        Loop through deletes 3 times to ensure they complete
        :arg chunk_list: A list of indices pre-chunked so it won't overload the
            URL size limit.
        """
        working_list = chunk_list
        for count in range(1, 4): # Try 3 times
            for i in working_list:
                self.loggit.info("---deleting index {0}".format(i))
            self.client.indices.delete(
                index=utils.to_csv(working_list), master_timeout=self.master_timeout)
            result = [ i for i in working_list if i in utils.get_indices(self.client)]
            if self._verify_result(result, count):
                return True
            else:
                working_list = result
        self.loggit.error(
            'Unable to delete the following indices after 3 attempts: '
            '{0}'.format(result)
        )
        return False

    def do_action(self):
        """
        Delete indices in `index_list.indices`
        """

        self.index_list.empty_list_check()
        self.loggit.info(
            'Deleting {0} selected indices: {1}'.format(len(self.index_list.indices), self.index_list.indices))
        try:
            index_lists = utils.chunk_index_list(self.index_list.indices)
            for l in index_lists:
                results = self.__chunk_loop(l)
            return results
        except Exception as exc:
            return exc
            #utils.report_failure(exc)

    #def do_dry_run(self):
        #override here


class ExtClose(curator.Close):
    """
    Extended Delete Indicies class from curator
    """
    def __init__(self, ilo, delete_aliases=False, skip_flush=False, ignore_sync_failures=False):
        super().__init__(ilo=ilo,
                    delete_aliases=delete_aliases,
                    skip_flush=skip_flush,
                    ignore_sync_failures=ignore_sync_failures)
    
    def _delete_aliases(self, index):
        self.loggit.debug('Deleting aliases from: {0}'.format(lst))
        try:
            self.client.indices.delete_alias(index=utils.to_csv(index), name='_all')
            self.loggit.debug('Deleted aliases from: {0}'.format(index))
        except Exception as err:
            self.loggit.warn(
                'Some indices may not have had aliases.  Exception:'
                ' {0}'.format(err)
            )
            raise err
    
    def _flush_synced(self, index):
        try:
            self.client.indices.flush_synced(index=utils.to_csv(index), ignore_unavailable=True)
        except ConflictError as err:
            if self.ignore_sync_failures:
                self.loggit.warn(
                    'Ignoring flushed sync failures: '
                    '{0} {1}'.format(err.error, err.info)
                )
            else:
                raise ConflictError(err.status_code, err.error, err.info)

    def do_action(self):
        """
        Close open indices in `index_list.indices`
        """
        self.index_list.filter_closed()
        self.index_list.empty_list_check()
        self.loggit.info(
            'Closing {0} selected indices: {1}'.format(
                len(self.index_list.indices), self.index_list.indices
            )
        )
        try:
            for lst in utils.chunk_index_list(self.index_list.indices):
                self.loggit.debug('CSV list of indices to close: {0}'.format(utils.to_csv(lst)))
                if self.delete_aliases:
                    self.loggit.info('Deleting aliases from indices before closing.')
                    self._delete_aliases(lst)
                if not self.skip_flush:
                    self._flush_synced(lst)
                self.client.indices.close(index=utils.to_csv(lst), ignore_unavailable=True)
            return True
        except Exception as exc:
            return exc
